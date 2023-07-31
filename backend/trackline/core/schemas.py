from collections.abc import Sequence
from typing import Annotated, Generic, Literal, TypeVar

from pydantic import BaseModel, StringConstraints

DataT = TypeVar("DataT")


class ErrorDetail(BaseModel):
    message: str
    location: Sequence[int | str] | None = None


class Error(BaseModel):
    code: Annotated[str, StringConstraints(to_upper=True)]
    message: str
    details: Sequence[ErrorDetail] | None = None


class Response(BaseModel):
    status: Literal["ok", "error"] = "ok"


class EntityResponse(Response, Generic[DataT]):
    status: Literal["ok"] = "ok"
    data: DataT


class ErrorResponse(Response):
    status: Literal["error"] = "error"
    error: Error
