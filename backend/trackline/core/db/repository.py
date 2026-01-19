from collections.abc import Mapping
from typing import Any, overload

from beanie import SortDirection
from injector import inject
from pymongo.asynchronous.client_session import AsyncClientSession
from pymongo.results import DeleteResult

from trackline.core.db.client import DatabaseClient
from trackline.core.db.models import BaseDocument
from trackline.core.db.unit_of_work import UnitOfWork
from trackline.core.fields import ResourceId

type Query = Mapping[str, Any]


class Repository:
    @inject
    def __init__(
        self,
        db_client: DatabaseClient,
        unit_of_work: UnitOfWork,
    ) -> None:
        self._db_client = db_client
        self._unit_of_work = unit_of_work

    @property
    def _session(self) -> AsyncClientSession | None:
        return self._db_client.session

    async def get[T: BaseDocument](
        self,
        document_type: type[T],
        document_id: ResourceId,
    ) -> T | None:
        return self._track(await document_type.get(document_id, session=self._session))

    async def get_one[T: BaseDocument](
        self,
        document_type: type[T],
        query: Query,
    ) -> T | None:
        return self._track(await document_type.find_one(query, session=self._session))

    async def get_many[T: BaseDocument](
        self,
        document_type: type[T],
        query: Query,
        sort: str | list[tuple[str, SortDirection]] | None = None,
    ) -> list[T]:
        return self._track_all(
            await document_type.find_many(
                query,
                sort=sort,
                session=self._session,
            ).to_list()
        )

    async def create[T: BaseDocument](self, document: T) -> T:
        return self._track(await document.create(session=self._session))

    async def delete(self, document: BaseDocument) -> DeleteResult | None:
        result = await document.delete(session=self._session)
        self._unit_of_work.remove(document)
        return result

    async def delete_many[T: BaseDocument](
        self,
        document_type: type[T],
        query: Query,
    ) -> DeleteResult | None:
        return await document_type.find_many(query).delete(session=self._session)

    @overload
    def _track[T: BaseDocument](self, document: T) -> T: ...

    @overload
    def _track(self, document: None) -> None: ...

    def _track[T: BaseDocument](self, document: T | None) -> T | None:
        if document:
            self._unit_of_work.add(document)
        return document

    def _track_all[T: BaseDocument](self, documents: list[T]) -> list[T]:
        for document in documents:
            self._unit_of_work.add(document)
        return documents
