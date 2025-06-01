from collections.abc import Awaitable, Callable, Sequence
import logging
import time

from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from injector import Injector
from sentry_sdk import capture_exception
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp, Receive, Scope, Send
from starlette.websockets import WebSocket

from trackline.core.db.client import DatabaseClient
from trackline.core.db.unit_of_work import UnitOfWork
from trackline.core.exceptions import RequestException
from trackline.core.schemas import Error, ErrorDetail, ErrorResponse
from trackline.core.utils import list_or_none
from trackline.core.utils.datetime import utcnow


log = logging.getLogger(__name__)


class NoIndexMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        response = await call_next(request)
        response.headers["x-robots-tag"] = "noindex, nofollow"

        return response


class ServerTimeMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        response = await call_next(request)
        response.headers["x-server-time"] = utcnow().isoformat()

        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        start_time = time.perf_counter()
        response = await call_next(request)
        end_time = time.perf_counter()
        duration = (end_time - start_time) * 1000

        log.info(
            f"{request.method} {request.url.path} - HTTP {response.status_code} ({duration:.2f} ms)"
        )

        return response


class ExceptionHandlingMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        match scope["type"]:
            case "http":
                await self._handle_request(scope, receive, send)
            case "websocket":
                await self._handle_websocket(scope, receive, send)
            case _:
                await self.app(scope, receive, send)

    async def _handle_request(self, scope: Scope, receive: Receive, send: Send) -> None:
        try:
            await self.app(scope, receive, send)
        except RequestValidationError as exc:
            await self._create_response(
                code="VALIDATION_ERROR",
                message="The request is invalid.",
                details=[
                    ErrorDetail(
                        message=err["msg"], location=list_or_none(err.get("loc"))
                    )
                    for err in exc.errors()
                ],
                status_code=400,
            )(scope, receive, send)
        except RequestException as exc:
            await self._create_response(
                code=exc.code,
                message=exc.message,
                status_code=exc.status_code,
            )(scope, receive, send)
        except Exception:
            capture_exception()
            log.exception("Unhandled exception", exc_info=True)
            await self._create_response(
                code="UNEXPECTED_ERROR",
                message="An unexpected error occurred.",
                status_code=500,
            )(scope, receive, send)

    async def _handle_websocket(
        self, scope: Scope, receive: Receive, send: Send
    ) -> None:
        ws = WebSocket(scope, receive, send)
        try:
            await self.app(scope, receive, send)
        except RequestValidationError:
            await ws.close(code=1008, reason="VALIDATION_ERROR")
        except RequestException as exc:
            await ws.close(code=1008, reason=exc.code)
        except Exception:
            capture_exception()
            log.exception("Unhandled exception", exc_info=True)
            await ws.close(code=1008)

    def _create_response(
        self,
        code: str,
        message: str,
        status_code: int,
        details: Sequence[ErrorDetail] | None = None,
    ) -> JSONResponse:
        content = ErrorResponse(
            error=Error(code=code, message=message, details=list_or_none(details)),
        )
        return JSONResponse(jsonable_encoder(content, exclude_none=True), status_code)


class UnitOfWorkMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, injector: Injector) -> None:
        super().__init__(app)
        self._injector = injector

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        db_client = self._injector.get(DatabaseClient)
        unit_of_work = self._injector.get(UnitOfWork)

        async with db_client.start_session():
            response = await call_next(request)
            await unit_of_work.save_changes()
            return response
