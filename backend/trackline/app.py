from fastapi import FastAPI, Request, WebSocket
from fastapi.exceptions import RequestValidationError, WebSocketRequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from trackline.auth.router import router as auth_router
from trackline.core.exceptions import RequestException
from trackline.core.ioc import AppContainer
from trackline.core.middleware import (
    DatabaseTransactionMiddleware,
    NoIndexMiddleware,
    ServerTimeMiddleware,
)
from trackline.core.utils.response import Error, make_error, make_errors
from trackline.games.router import router as games_router
from trackline.spotify.router import router as spotify_router
from trackline.users.router import router as users_router


app = FastAPI(
    title="Trackline",
)
container = AppContainer()  # type: ignore

app.add_middleware(NoIndexMiddleware)
app.add_middleware(ServerTimeMiddleware)
app.add_middleware(DatabaseTransactionMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-server-time"],
)

app.include_router(auth_router)
app.include_router(games_router)
app.include_router(spotify_router)
app.include_router(users_router)


@app.on_event("startup")
async def on_startup():
    if task := container.init_resources():
        await task


@app.on_event("shutdown")
async def on_shutdown():
    if task := container.shutdown_resources():
        await task


@app.exception_handler(Exception)
async def global_exception_handler(_, exc: Exception):
    return make_error(
        code="UNEXPECTED_ERROR",
        description="An unexpected error occurred.",
        status_code=500,
    )


@app.exception_handler(RequestException)
async def request_exception_handler(
    request: Request | WebSocket, exc: RequestException
):
    if isinstance(request, WebSocket):
        await request.close(code=1008, reason=exc.code)
    else:
        return make_error(
            code=exc.code,
            description=exc.description,
            location=exc.location,
            status_code=exc.status_code,
        )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError):
    errors = [
        Error(code="VALIDATION_ERROR", description=err["msg"], location=err.get("loc"))
        for err in exc.errors()
    ]
    return make_errors(errors=errors, status_code=400)


@app.exception_handler(WebSocketRequestValidationError)
async def ws_validation_exception_handler(
    ws: WebSocket, exc: WebSocketRequestValidationError
):
    pass
