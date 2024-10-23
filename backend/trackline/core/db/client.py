from contextlib import asynccontextmanager

from injector import Inject
from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorClientSession,
    AsyncIOMotorDatabase,
)

from trackline.core.settings import Settings


class DatabaseClient:
    def __init__(self, settings: Inject[Settings]) -> None:
        self._client: AsyncIOMotorClient = AsyncIOMotorClient(
            settings.db_uri, tz_aware=True
        )
        self._database: AsyncIOMotorDatabase = self._client[settings.db_name]

        self._session: AsyncIOMotorClientSession | None = None

    @property
    def session(self) -> AsyncIOMotorClientSession | None:
        return self._session

    @property
    def database(self) -> AsyncIOMotorDatabase:
        return self._database

    @asynccontextmanager
    async def transaction(self):
        async with await self._client.start_session() as self._session:
            async with self._session.start_transaction():
                yield

        self._session = None
