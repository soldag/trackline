import logging

from fastapi import Depends, FastAPI, WebSocket
from fastapi.exceptions import WebSocketRequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi_injector import attach_injector, InjectorMiddleware
from injector import Injector

from trackline.auth.deps import websocket_logger
from trackline.auth.router import router as auth_router
from trackline.core.di import CoreModule
from trackline.core.middleware import (
    DatabaseTransactionMiddleware,
    ExceptionHandlingMiddleware,
    LoggingMiddleware,
    NoIndexMiddleware,
    ServerTimeMiddleware,
)
from trackline.games.di import GamesModule
from trackline.games.router import router as games_router
from trackline.spotify.client import SpotifyClient
from trackline.spotify.di import SpotifyModule
from trackline.spotify.router import router as spotify_router
from trackline.users.router import router as users_router


log = logging.getLogger(__name__)


app = FastAPI(
    title="Trackline",
    dependencies=[Depends(websocket_logger)],
)

injector = Injector([CoreModule(), GamesModule(), SpotifyModule()])
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


@app.exception_handler(WebSocketRequestValidationError)
async def ws_validation_exception_handler(
    ws: WebSocket, exc: WebSocketRequestValidationError
):
    pass
