from contextlib import asynccontextmanager

from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorClientSession,
    AsyncIOMotorDatabase,
)


class DatabaseClient:
    def __init__(self, db_uri: str, db_name: str) -> None:
        self._client = AsyncIOMotorClient(db_uri, tz_aware=True)
        self._database: AsyncIOMotorDatabase = self._client[db_name]

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
