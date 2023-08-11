import logging
from typing import Annotated

from fastapi import Depends, Query, Request
from fastapi.security.http import HTTPAuthorizationCredentials, HTTPBearer
from fastapi_injector import Injected

from trackline.auth.repository import SessionRepository
from trackline.auth.use_cases import GetSessionUser
from trackline.core.exceptions import RequestException
from trackline.core.fields import ResourceId


log = logging.getLogger(__name__)


class OptionalHTTPBearer(HTTPBearer):
    async def __call__(
        self, request: Request = None  # type: ignore
    ) -> HTTPAuthorizationCredentials | None:
        if not request:
            return None

        return await super().__call__(request)


_auth = OptionalHTTPBearer(auto_error=False)


def get_auth_token(
    auth: Annotated[HTTPAuthorizationCredentials, Depends(_auth)],
    session_token: str | None = Query(default=None, include_in_schema=False),
) -> str:
    if auth:
        return auth.credentials
    if session_token:
        return session_token

    raise RequestException(
        "UNAUTHORIZED",
        "You must be authorized to perform this request.",
        status_code=401,
    )


AuthToken = Annotated[str, Depends(get_auth_token)]


async def get_auth_user_id(
    token: Annotated[str, Depends(get_auth_token)],
    session_repository: Annotated[SessionRepository, Injected(SessionRepository)],
) -> ResourceId:
    use_case = GetSessionUser(token=token)
    handler = GetSessionUser.Handler(session_repository)
    user_id = await handler.execute(use_case)

    if not user_id:
        raise RequestException(
            "INVALID_TOKEN", "The session token is invalid.", status_code=400
        )

    return user_id


AuthUserId = Annotated[ResourceId, Depends(get_auth_user_id)]
