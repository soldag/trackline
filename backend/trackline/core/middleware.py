import asyncio
import random
from typing import Awaitable, Callable

from dependency_injector.wiring import inject, Provide
from pymongo.errors import OperationFailure
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from trackline.configuration import (
    DB_TXN_RETRIES_JITTER,
    DB_TXN_RETRIES_MAX,
    DB_TXN_RETRIES_MIN_INTERVAL,
)
from trackline.core.db.client import DatabaseClient
from trackline.core.ioc import AppContainer
from trackline.core.utils.response import make_error


class NoIndexMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        response = await call_next(request)
        response.headers["x-robots-tag"] = "noindex, nofollow"

        return response


class DatabaseTransactionMiddleware(BaseHTTPMiddleware):
    @inject
    def __init__(
        self,
        app,
        db: DatabaseClient = Provide[AppContainer.core.database_client],
    ) -> None:
        super().__init__(app)
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

                if retries >= DB_TXN_RETRIES_MAX:
                    return make_error(
                        status_code=409,
                        code="CONFLICT",
                        description="The request could not be executed due to a conflict with another request.",
                    )

                base_interval = DB_TXN_RETRIES_MIN_INTERVAL * 2**retries
                jitter = random.randrange(0, DB_TXN_RETRIES_JITTER)
                interval = (base_interval + jitter) / 1000
                await asyncio.sleep(interval)

                retries += 1
