from copy import copy
from typing import (
    Any,
    Dict,
    Generic,
    get_args,
    List,
    Mapping,
    Sequence,
    Type,
    TypeVar,
)

from bson import ObjectId
from pydantic import BaseModel

from trackline.core.db.client import DatabaseClient
from trackline.core.db.models import IdentifiableModel, StringId


T = TypeVar("T", bound=IdentifiableModel)


class Repository(Generic[T]):
    class Meta:
        collection_name: str

    def __init__(self, db: DatabaseClient) -> None:
        super().__init__()
        self._collection = db.database[self.Meta.collection_name]
        self._session = db.session
        self._model_type = get_args(self.__orig_bases__[0])[0]  # type: ignore

    async def create(self, model: T) -> None:
        document = self._to_document(model)
        await self._collection.insert_one(document, session=self._session)

    async def find_by_id(self, model_id: str) -> T | None:
        return await self._find_one(self._id_query(model_id))

    async def find_one(self, query: Mapping[str, Any]) -> T | None:
        return await self._find_one(self._transform_query(query))

    async def find_by_ids(self, model_ids: Sequence[str]) -> List[T]:
        return await self._find(self._ids_query(model_ids))

    async def find(self, query: Mapping[str, Any]) -> Sequence[T]:
        return await self._find(self._transform_query(query))

    async def update_by_id(self, model_id: str, update: Mapping[str, Any]) -> int:
        return await self._update_one(self._id_query(model_id), {"$set": update})

    async def delete_by_id(self, model_id: str) -> int:
        return await self._delete_one(self._id_query(model_id))

    async def delete_one(self, query: Mapping[str, Any]) -> int:
        return await self._delete_one(self._transform_query(query))

    async def _find_one(self, query: Mapping[str, Any]) -> T | None:
        document = await self._collection.find_one(
            filter=self._transform_query(query),
            session=self._session,
        )
        return self._to_model(document) if document else None

    async def _find(self, query: Mapping[str, Any]) -> List[T]:
        documents = await self._collection.find(
            filter=self._transform_query(query),
            session=self._session,
        ).to_list(None)
        return [self._to_model(document) for document in documents]

    async def _update_one(
        self,
        query: Mapping[str, Any],
        update: Mapping[str, Any],
        array_filters: Sequence[Mapping[str, Any]] | None = None,
    ) -> int:
        result = await self._collection.update_one(
            filter=self._transform_query(query),
            update=update,
            array_filters=array_filters,
            session=self._session,
        )
        return result.modified_count

    async def _delete_one(self, query: Mapping[str, Any]) -> int:
        result = await self._collection.delete_one(
            filter=self._transform_query(query),
            session=self._session,
        )
        return result.deleted_count

    def _transform_query(self, query: Mapping[str, Any]) -> Mapping[str, Any]:
        query = dict(query)
        if id_filter := query.pop("id", None):
            query["_id"] = id_filter
        return query

    def _id_query(self, model_id: str) -> Mapping[str, ObjectId]:
        return {"_id": ObjectId(model_id)}

    def _ids_query(
        self, model_ids: Sequence[str]
    ) -> Mapping[str, Dict[str, List[ObjectId]]]:
        return {"_id": {"$in": [ObjectId(model_id) for model_id in model_ids]}}

    def _to_document(self, model: BaseModel, root: bool = True) -> Dict:
        result = self._replace_type(model.dict(), StringId, ObjectId)
        if root and (model_id := result.pop("id", None)):
            result["_id"] = model_id
        return result

    def _to_model(self, data: Dict, root: bool = True) -> T:
        data = self._replace_type(data, ObjectId, StringId)
        if root and (model_id := data.pop("_id", None)):
            data["id"] = str(model_id)
        return self._model_type(**data)

    def _replace_type(self, obj: Any, src_type: Type, dst_type: Type) -> Dict:
        obj = copy(obj)

        if isinstance(obj, src_type):
            obj = dst_type(obj)
        elif isinstance(obj, dict):
            for key, value in obj.items():
                obj[key] = self._replace_type(value, src_type, dst_type)
        elif isinstance(obj, list):
            obj = [self._replace_type(value, src_type, dst_type) for value in obj]

        return obj