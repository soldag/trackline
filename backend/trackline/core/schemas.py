from typing import Annotated, Literal

from pydantic import BaseModel, StringConstraints


class ErrorDetail(BaseModel):
    message: str
    location: list[int | str] | None = None


class Error(BaseModel):
    code: Annotated[str, StringConstraints(to_upper=True)]
    message: str
    details: list[ErrorDetail] | None = None


class EmptyResponse(BaseModel):
    status: Literal["ok"] = "ok"


class EntityResponse[TData](BaseModel):
    status: Literal["ok"] = "ok"
    data: TData


class ErrorResponse(BaseModel):
    status: Literal["error"] = "error"
    error: Error
