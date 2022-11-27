from typing import Annotated, Generic, Literal, Sequence, TypeVar

from pydantic import BaseModel, constr, Field
from pydantic.generics import GenericModel


DataT = TypeVar("DataT")


class Error(BaseModel):
    code: Annotated[str, constr(to_upper=True)]
    description: str
    location: Sequence[str] | None = None


class Response(BaseModel):
    status: Literal["ok", "error"] = "ok"


class EntityResponse(Response, GenericModel, Generic[DataT]):
    status: Literal["ok"] = Field("ok", const=True)
    data: DataT


class ErrorResponse(Response):
    status: Literal["error"] = Field("error", const=True)
    errors: Sequence[Error]
