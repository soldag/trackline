from collections.abc import Mapping
from typing import Any, overload, TypeVar

from injector import Inject
from motor.motor_asyncio import AsyncIOMotorClientSession
from pymongo.results import DeleteResult

from trackline.core.db.client import DatabaseClient
from trackline.core.db.models import BaseDocument
from trackline.core.db.unit_of_work import UnitOfWork
from trackline.core.fields import ResourceId


type Query = Mapping[str, Any]

TDocument = TypeVar("TDocument", bound=BaseDocument)


class Repository:
    def __init__(
        self,
        db_client: Inject[DatabaseClient],
        unit_of_work: Inject[UnitOfWork],
    ) -> None:
        self._db_client = db_client
        self._unit_of_work = unit_of_work

    @property
    def _session(self) -> AsyncIOMotorClientSession | None:
        return self._db_client.session

    async def get(
        self, document_type: type[TDocument], document_id: ResourceId
    ) -> TDocument | None:
        return self._track(await document_type.get(document_id, session=self._session))

    async def get_one(
        self, document_type: type[TDocument], query: Query
    ) -> TDocument | None:
        return self._track(await document_type.find_one(query, session=self._session))

    async def get_many(
        self, document_type: type[TDocument], query: Query
    ) -> list[TDocument]:
        return self._track_all(await document_type.find_many(query).to_list())

    async def create(self, document: TDocument) -> TDocument:
        return self._track(await document.create(session=self._session))

    async def delete(self, document: BaseDocument) -> DeleteResult | None:
        result = await document.delete(session=self._session)
        self._unit_of_work.remove(document)
        return result

    async def delete_many(
        self, document_type: type[TDocument], query: Query
    ) -> DeleteResult | None:
        return await document_type.find_many(query).delete(session=self._session)

    @overload
    def _track(self, document: TDocument) -> TDocument: ...

    @overload
    def _track(self, document: None) -> None: ...

    def _track(self, document: TDocument | None) -> TDocument | None:
        if document:
            self._unit_of_work.add(document)
        return document

    def _track_all(self, documents: list[TDocument]) -> list[TDocument]:
        for document in documents:
            self._unit_of_work.add(document)

        return documents
