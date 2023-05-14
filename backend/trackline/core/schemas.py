from collections.abc import Sequence
from typing import Annotated, Generic, Literal, TypeVar

from pydantic import BaseModel, constr, Field
from pydantic.generics import GenericModel
from pydantic.main import ModelMetaclass

from trackline.core.fields import ResourceId


DataT = TypeVar("DataT")


class BaseSchema(BaseModel):
    class Config:
        json_encoders = {ResourceId: str}


class ErrorDetail(BaseSchema):
    message: str
    location: Sequence[int | str] | None = None


class Error(BaseSchema):
    code: Annotated[str, constr(to_upper=True)]
    message: str
    details: Sequence[ErrorDetail] | None = None


class Response(BaseSchema):
    status: Literal["ok", "error"] = "ok"


class EntityResponse(Response, GenericModel, Generic[DataT]):
    status: Literal["ok"] = Field("ok", const=True)
    data: DataT


class ErrorResponse(Response):
    status: Literal["error"] = Field("error", const=True)
    error: Error


class Omit(ModelMetaclass):
    def __new__(cls, name, bases, namespaces, **kwargs):
        omit_fields = getattr(namespaces.get("Config", {}), "omit_fields", {})
        fields = namespaces.get("__fields__", {})
        annotations = namespaces.get("__annotations__", {})
        for base in bases:
            fields.update(base.__fields__)
            annotations.update(base.__annotations__)
        merged_keys = fields.keys() & annotations.keys()
        [merged_keys.add(field) for field in fields]
        new_fields = {}
        new_annotations = {}
        for field in merged_keys:
            if not field.startswith("__") and field not in omit_fields:
                new_annotations[field] = annotations.get(field, fields[field].type_)
                new_fields[field] = fields[field]
        namespaces["__annotations__"] = new_annotations
        namespaces["__fields__"] = new_fields
        return super().__new__(cls, name, bases, namespaces, **kwargs)
