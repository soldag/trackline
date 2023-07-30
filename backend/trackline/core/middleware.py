import asyncio
from collections.abc import Awaitable, Callable
import logging
import random
import time

from fastapi.exceptions import RequestValidationError
from injector import Injector
from pymongo.errors import OperationFailure
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp, Receive, Scope, Send
from starlette.websockets import WebSocket

from trackline.core.db.client import DatabaseClient
from trackline.core.exceptions import RequestException
from trackline.core.schemas import ErrorDetail
from trackline.core.settings import Settings
from trackline.core.utils.datetime import utcnow
from trackline.core.utils.response import make_error


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
            await make_error(
                code="VALIDATION_ERROR",
                message="The request is invalid.",
                details=[
                    ErrorDetail(message=err["msg"], location=err.get("loc"))
                    for err in exc.errors()
                ],
                status_code=400,
            )(scope, receive, send)
        except RequestException as exc:
            await make_error(
                code=exc.code,
                message=exc.message,
                status_code=exc.status_code,
            )(scope, receive, send)
        except Exception:
            log.exception("Unhandled exception", exc_info=True)
            await make_error(
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
            log.exception("Unhandled exception", exc_info=True)
            await ws.close(code=1008)


class DatabaseTransactionMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, injector: Injector) -> None:
        super().__init__(app)
        self._injector = injector

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        settings = self._injector.get(Settings)
        db_client = self._injector.get(DatabaseClient)

        retries = 0
        while True:
            try:
                async with db_client.transaction():
                    return await call_next(request)
            except OperationFailure as e:
                if e.code != 112:
                    raise e

                if retries >= settings.db_txn_retries_max:
                    return make_error(
                        status_code=409,
                        code="REQUEST_CONFLICT",
                        message="The request could not be executed due to a conflict with another request.",
                    )

                base_interval = settings.db_txn_retries_min_interval * 2**retries
                jitter = random.randrange(0, settings.db_txn_retries_jitter)
                interval = (base_interval + jitter) / 1000
                await asyncio.sleep(interval)

                retries += 1
