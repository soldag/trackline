import asyncio
from collections.abc import Awaitable, Callable
import logging
import random
import time

from injector import Injector
from pymongo.errors import OperationFailure
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from trackline.core.db.client import DatabaseClient
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
