from collections.abc import Awaitable, Callable

from injector import Injector
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from trackline.games.services.notifications.notifier import Notifier


class NotifierMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, injector: Injector) -> None:
        super().__init__(app)
        self._injector = injector

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        notifier = self._injector.get(Notifier)
        try:
            response = await call_next(request)
            await notifier.flush()
            return response
        finally:
            notifier.clear()
