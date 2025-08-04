import logging

from beanie.exceptions import RevisionIdWasChanged
from injector import inject
from pymongo.asynchronous.client_session import AsyncClientSession
from pymongo.errors import OperationFailure

from trackline.core.db.client import DatabaseClient
from trackline.core.db.models import BaseDocument
from trackline.core.fields import ResourceId
from trackline.core.settings import Settings

log = logging.getLogger(__name__)

WRITE_CONFLICT_ERROR_CODE = 112

type Key = tuple[type, ResourceId]


class TransactionConflictError(Exception):
    pass


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

        try:
            return await self._save_changes(session)
        except OperationFailure as e:
            log.exception("Saving changes failed")
            if e.code == WRITE_CONFLICT_ERROR_CODE:
                raise TransactionConflictError from e
        except RevisionIdWasChanged as e:
            log.exception("Saving changes failed")
            raise TransactionConflictError from e

    async def _save_changes(self, session: AsyncClientSession) -> None:
        for document in self._documents.values():
            if document.is_changed:
                await document.save_changes(session=session)

    def _get_key(self, document: BaseDocument) -> Key:
        if not document.id:
            raise ValueError("Cannot add document without ID")

        return (type(document), document.id)
