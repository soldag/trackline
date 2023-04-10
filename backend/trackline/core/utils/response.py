from collections.abc import Collection, Sequence
from typing import TypeVar

from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from trackline.core.schemas import EntityResponse, Error, ErrorResponse, Response


DataT = TypeVar("DataT")


def make_ok(data: DataT | None = None, status_code: int = 200) -> JSONResponse:
    content = EntityResponse(data=data) if data is not None else Response()
    return JSONResponse(jsonable_encoder(content), status_code)


def make_error(
    code: str, description: str, status_code: int, location: Sequence[str] | None = None
) -> JSONResponse:
    errors = [Error(code=code, description=description, location=location)]
    return make_errors(errors, status_code)


def make_errors(errors: Collection[Error], status_code: int) -> JSONResponse:
    content = ErrorResponse(errors=list(errors))
    return JSONResponse(jsonable_encoder(content, exclude_none=True), status_code)
