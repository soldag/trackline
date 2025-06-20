import logging
from typing import Annotated

from fastapi import Depends, Query, Request
from fastapi.security.http import HTTPAuthorizationCredentials, HTTPBearer
from fastapi_injector import Injected

from trackline.auth.use_cases import GetSessionUser
from trackline.core.exceptions import RequestError
from trackline.core.fields import ResourceId

log = logging.getLogger(__name__)


class OptionalHTTPBearer(HTTPBearer):
    async def __call__(
        self,
        request: Request = None,  # type: ignore[assignment]
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

    raise RequestError(
        code="UNAUTHORIZED",
        message="You must be authorized to perform this request.",
        status_code=401,
    )


AuthToken = Annotated[str, Depends(get_auth_token)]


async def get_auth_user_id(
    token: Annotated[str, Depends(get_auth_token)],
    handler: Annotated[GetSessionUser.Handler, Injected(GetSessionUser.Handler)],
) -> ResourceId:
    user_id = await handler.execute(GetSessionUser(token=token))
    if not user_id:
        raise RequestError(
            code="INVALID_TOKEN",
            message="The session token is invalid.",
            status_code=400,
        )

    return user_id


AuthUserId = Annotated[ResourceId, Depends(get_auth_user_id)]
