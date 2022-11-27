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
from trackline.ioc import Container
from trackline.services.database import DatabaseClient
from trackline.utils.responses import make_error


class DatabaseTransactionMiddleware(BaseHTTPMiddleware):
    @inject
    def __init__(
        self, app, database: DatabaseClient = Provide[Container.database]
    ) -> None:
        super().__init__(app)
        self._database = database

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        retries = 0
        while True:
            try:
                async with self._database.transaction():
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
