import asyncio
from collections.abc import Awaitable, Callable
import random

from dependency_injector.wiring import inject, Provide
from pymongo.errors import OperationFailure
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from trackline.core.db.client import DatabaseClient
from trackline.core.ioc import AppContainer
from trackline.core.settings import Settings
from trackline.core.utils.datetime import utcnow
from trackline.core.utils.response import make_error


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


class DatabaseTransactionMiddleware(BaseHTTPMiddleware):
    @inject
    def __init__(
        self,
        app,
        settings: Settings = Provide[AppContainer.core.settings],
        db: DatabaseClient = Provide[AppContainer.core.database_client],
    ) -> None:
        super().__init__(app)
        self._settings = settings
        self._db = db

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        retries = 0
        while True:
            try:
                async with self._db.transaction():
                    return await call_next(request)
            except OperationFailure as e:
                if e.code != 112:
                    raise e

                if retries >= self._settings.db_txn_retries_max:
                    return make_error(
                        status_code=409,
                        code="CONFLICT",
                        description="The request could not be executed due to a conflict with another request.",
                    )

                base_interval = (
                    self._settings.db_txn_retries_min_interval * 2**retries
                )
                jitter = random.randrange(0, self._settings.db_txn_retries_jitter)
                interval = (base_interval + jitter) / 1000
                await asyncio.sleep(interval)

                retries += 1
