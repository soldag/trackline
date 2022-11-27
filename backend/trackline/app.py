from fastapi import FastAPI, Request, WebSocket
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from trackline.ioc import Container
from trackline.middleware import DatabaseTransactionMiddleware
from trackline.routers import auth, games, spotify, users
from trackline.schema.responses import Error
from trackline.utils.exceptions import RequestException
from trackline.utils.responses import make_error, make_errors


app = FastAPI(
    title="Trackline",
)
app.container = Container()  # type: ignore

app.add_middleware(DatabaseTransactionMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(games.router)
app.include_router(spotify.router)
app.include_router(users.router)


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
