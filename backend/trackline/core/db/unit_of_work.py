import asyncio
import random

from injector import Inject
from motor.motor_asyncio import AsyncIOMotorClientSession
from pymongo.errors import OperationFailure

from trackline.core.db.client import DatabaseClient
from trackline.core.db.models import BaseDocument
from trackline.core.exceptions import RequestException
from trackline.core.fields import ResourceId
from trackline.core.settings import Settings


type Key = tuple[type, ResourceId]


class UnitOfWork:
    def __init__(
        self,
        db_client: Inject[DatabaseClient],
        settings: Inject[Settings],
    ) -> None:
        self._db_client = db_client
        self._settings = settings

        self._documents: dict[Key, BaseDocument] = {}

    def add(self, document: BaseDocument) -> None:
        self._documents[self._get_key(document)] = document

    def remove(self, document: BaseDocument) -> None:
        self._documents.pop(self._get_key(document), None)

    def clear(self) -> None:
        self._documents.clear()

    async def save_changes(self) -> None:
        session = self._db_client.session
        if not session:
            raise RuntimeError("Session is required")

        for attempt in range(self._settings.db_txn_retries_max_attempts):
            try:
                return await self._save_changes(session)
            except OperationFailure as e:
                if e.code != 112:
                    raise e

                base_interval = self._settings.db_txn_retries_min_interval * 2**attempt
                jitter = random.randrange(0, self._settings.db_txn_retries_jitter)
                interval = (base_interval + jitter) / 1000
                await asyncio.sleep(interval)

        raise RequestException(
            status_code=409,
            code="REQUEST_CONFLICT",
            message="The request could not be executed due to a conflict with another request.",
        )

    async def _save_changes(self, session: AsyncIOMotorClientSession) -> None:
        async with session.start_transaction():
            for document in self._documents.values():
                if document.is_changed:
                    await document.save_changes(session=session)

    def _get_key(self, document: BaseDocument) -> Key:
        if not document.id:
            raise ValueError("Cannot add document without ID")

        return (type(document), document.id)
