from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from contextvars import ContextVar

from beanie import init_beanie
from injector import inject
from pymongo import AsyncMongoClient
from pymongo.asynchronous.client_session import AsyncClientSession

from trackline.auth.models import Session
from trackline.core.settings import Settings
from trackline.games.models import Game
from trackline.users.models import User

session_ctx: ContextVar[AsyncClientSession | None] = ContextVar(
    "db_session",
    default=None,
)


class DatabaseClient:
    @inject
    def __init__(self, settings: Settings) -> None:
        self._client: AsyncMongoClient = AsyncMongoClient(
            settings.db_uri,
            tz_aware=True,
        )
        self._database = self._client[settings.db_name]

    @property
    def session(self) -> AsyncClientSession | None:
        return session_ctx.get()

    async def initialize(self) -> None:
        await init_beanie(
            database=self._database,
            document_models=[Session, Game, User],
            skip_indexes=True,
        )

    @asynccontextmanager
    async def start_session(self) -> AsyncIterator[AsyncClientSession]:
        async with self._client.start_session() as session:
            token = session_ctx.set(session)
            try:
                yield session
            finally:
                session_ctx.reset(token)
