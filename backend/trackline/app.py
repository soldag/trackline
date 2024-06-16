from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
import logging

from fastapi import Depends, FastAPI, WebSocket
from fastapi.exceptions import RequestValidationError, WebSocketRequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi_injector import attach_injector, InjectorMiddleware
from injector import Injector

from trackline.auth.router import router as auth_router
from trackline.core.deps import websocket_logger
from trackline.core.di import CoreModule
from trackline.core.logging import initialize_sentry
from trackline.core.middleware import (
    DatabaseTransactionMiddleware,
    ExceptionHandlingMiddleware,
    LoggingMiddleware,
    NoIndexMiddleware,
    ServerTimeMiddleware,
)
from trackline.core.schemas import ErrorResponse
from trackline.core.settings import Settings
from trackline.games.di import GamesModule
from trackline.games.router import router as games_router
from trackline.spotify.di import SpotifyModule
from trackline.spotify.router import router as spotify_router
from trackline.spotify.services.client import SpotifyClient
from trackline.users.router import router as users_router


log = logging.getLogger(__name__)


injector = Injector([CoreModule(), GamesModule(), SpotifyModule()])


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator:
    log.info("Waiting for application startup.")

    initialize_sentry(injector.get(Settings))

    spotify_client = injector.get(SpotifyClient)
    await spotify_client.initialize()

    log.info("Application startup complete.")

    yield

    log.info("Waiting for application shutdown.")

    spotify_client = injector.get(SpotifyClient)
    await spotify_client.close()

    log.info("Application shutdown complete.")


app = FastAPI(
    title="Trackline",
    dependencies=[Depends(websocket_logger)],
    lifespan=lifespan,
    responses={
        422: {"description": "Validation Error", "model": ErrorResponse},
    },
)
attach_injector(app, injector)

app.add_middleware(DatabaseTransactionMiddleware, injector=injector)
app.add_middleware(InjectorMiddleware, injector=injector)
app.add_middleware(ExceptionHandlingMiddleware)
app.add_middleware(ServerTimeMiddleware)
app.add_middleware(NoIndexMiddleware)
app.add_middleware(LoggingMiddleware)
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


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    # This is needed to disable the builtin error handler of fastapi
    # and instead use the custom ExceptionHandlingMiddleware
    raise exc


@app.exception_handler(WebSocketRequestValidationError)
async def ws_validation_exception_handler(
    ws: WebSocket, exc: WebSocketRequestValidationError
):
    pass
