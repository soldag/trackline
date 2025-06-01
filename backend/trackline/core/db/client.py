from contextlib import asynccontextmanager
from contextvars import ContextVar

from beanie import init_beanie
from injector import Inject
from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorClientSession,
    AsyncIOMotorDatabase,
)

from trackline.auth.models import Session
from trackline.core.settings import Settings
from trackline.games.models import Game
from trackline.users.models import User


session_ctx: ContextVar[AsyncIOMotorClientSession | None] = ContextVar(
    "db_session",
    default=None,
)


class DatabaseClient:
    def __init__(self, settings: Inject[Settings]) -> None:
        self._client: AsyncIOMotorClient = AsyncIOMotorClient(
            settings.db_uri, tz_aware=True
        )
        self._database: AsyncIOMotorDatabase = self._client[settings.db_name]

    @property
    def session(self) -> AsyncIOMotorClientSession | None:
        return session_ctx.get()

    async def initialize(self) -> None:
        await init_beanie(
            database=self._database,
            document_models=[Session, Game, User],
            skip_indexes=True,
        )

    @asynccontextmanager
    async def start_session(self):
        async with await self._client.start_session() as session:
            token = session_ctx.set(session)
            try:
                yield session
            finally:
                session_ctx.reset(token)
