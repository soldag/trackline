import logging

from fastapi import FastAPI, Request, WebSocket
from fastapi.exceptions import RequestValidationError, WebSocketRequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi_injector import attach_injector, InjectorMiddleware
from injector import Injector

from trackline.auth.router import router as auth_router
from trackline.core.di import CoreModule
from trackline.core.exceptions import RequestException
from trackline.core.middleware import (
    DatabaseTransactionMiddleware,
    LoggingMiddleware,
    NoIndexMiddleware,
    ServerTimeMiddleware,
)
from trackline.core.schemas import ErrorDetail
from trackline.core.utils.response import make_error
from trackline.games.di import GamesModule
from trackline.games.router import router as games_router
from trackline.spotify.client import SpotifyClient
from trackline.spotify.di import SpotifyModule
from trackline.spotify.router import router as spotify_router
from trackline.users.router import router as users_router


log = logging.getLogger(__name__)


app = FastAPI(
    title="Trackline",
)

injector = Injector([CoreModule(), GamesModule(), SpotifyModule()])
attach_injector(app, injector)

app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-server-time"],
)
app.add_middleware(LoggingMiddleware)
app.add_middleware(ServerTimeMiddleware)
app.add_middleware(NoIndexMiddleware)
app.add_middleware(DatabaseTransactionMiddleware, injector=injector)
app.add_middleware(InjectorMiddleware, injector=injector)

app.include_router(auth_router)
app.include_router(games_router)
app.include_router(spotify_router)
app.include_router(users_router)


@app.on_event("startup")
async def on_startup():
    log.info("Waiting for application startup.")

    spotify_client = injector.get(SpotifyClient)
    await spotify_client.initialize()

    log.info("Application startup complete.")


@app.on_event("shutdown")
async def on_shutdown():
    log.info("Waiting for application shutdown.")

    spotify_client = injector.get(SpotifyClient)
    await spotify_client.close()

    log.info("Application shutdown complete.")


@app.exception_handler(Exception)
async def global_exception_handler(_, exc: Exception):
    return make_error(
        code="UNEXPECTED_ERROR",
        message="An unexpected error occurred.",
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
            message=exc.message,
            status_code=exc.status_code,
        )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError):
    return make_error(
        code="VALIDATION_ERROR",
        message="The request is invalid.",
        details=[
            ErrorDetail(message=err["msg"], location=err.get("loc"))
            for err in exc.errors()
        ],
        status_code=400,
    )


@app.exception_handler(WebSocketRequestValidationError)
async def ws_validation_exception_handler(
    ws: WebSocket, exc: WebSocketRequestValidationError
):
    pass
