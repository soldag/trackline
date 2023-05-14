from collections.abc import Sequence
from typing import Any

from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from trackline.core.schemas import (
    EntityResponse,
    Error,
    ErrorDetail,
    ErrorResponse,
    Response,
)


def make_ok(data: Any = None, status_code: int = 200) -> JSONResponse:
    content = EntityResponse(data=data) if data is not None else Response()
    return JSONResponse(jsonable_encoder(content), status_code)


def make_error(
    code: str,
    message: str,
    status_code: int,
    details: Sequence[ErrorDetail] | None = None,
) -> JSONResponse:
    content = ErrorResponse(error=Error(code=code, message=message, details=details))
    return JSONResponse(jsonable_encoder(content, exclude_none=True), status_code)
