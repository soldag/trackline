import asyncio
import random

from injector import inject
from pymongo.asynchronous.client_session import AsyncClientSession
from pymongo.errors import OperationFailure

from trackline.core.db.client import DatabaseClient
from trackline.core.db.models import BaseDocument
from trackline.core.exceptions import RequestError
from trackline.core.fields import ResourceId
from trackline.core.settings import Settings

WRITE_CONFLICT_ERROR_CODE = 112

type Key = tuple[type, ResourceId]


class UnitOfWork:
    @inject
    def __init__(
        self,
        db_client: DatabaseClient,
        settings: Settings,
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
                if e.code != WRITE_CONFLICT_ERROR_CODE:
                    raise

                base_interval = self._settings.db_txn_retries_min_interval * 2**attempt
                jitter = random.randrange(0, self._settings.db_txn_retries_jitter)  # noqa: S311
                interval = (base_interval + jitter) / 1000
                await asyncio.sleep(interval)

        raise RequestError(
            code="REQUEST_CONFLICT",
            message=(
                "The request could not be executed due "
                "to a conflict with another request."
            ),
            status_code=409,
        )

    async def _save_changes(self, session: AsyncClientSession) -> None:
        async with await session.start_transaction():  # type: ignore[reportUnknownMemberType]
            for document in self._documents.values():
                if document.is_changed:
                    await document.save_changes(session=session)

    def _get_key(self, document: BaseDocument) -> Key:
        if not document.id:
            raise ValueError("Cannot add document without ID")

        return (type(document), document.id)
