from typing import Annotated, Literal

from pydantic import BaseModel, StringConstraints


class ErrorDetail(BaseModel):
    message: str
    location: list[int | str] | None = None


class Error(BaseModel):
    code: Annotated[str, StringConstraints(to_upper=True)]
    message: str
    details: list[ErrorDetail] | None = None


class Response(BaseModel):
    status: Literal["ok", "error"] = "ok"


class EntityResponse[TData](Response):
    status: Literal["ok"] = "ok"
    data: TData


class ErrorResponse(Response):
    status: Literal["error"] = "error"
    error: Error
