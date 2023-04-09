from dependency_injector.wiring import inject, Provide
from fastapi import Depends, Query, Request
from fastapi.security.http import HTTPAuthorizationCredentials, HTTPBearer

from trackline.auth.repository import SessionRepository
from trackline.auth.use_cases import GetSessionUser
from trackline.core.exceptions import RequestException
from trackline.core.fields import ResourceId
from trackline.core.ioc import AppContainer


class OptionalHTTPBearer(HTTPBearer):
    async def __call__(
        self, request: Request = None  # type: ignore
    ) -> HTTPAuthorizationCredentials | None:
        if not request:
            return None

        return await super().__call__(request)


_auth = OptionalHTTPBearer(auto_error=False)


def get_auth_token(
    session_token: str | None = Query(default=None, include_in_schema=False),
    auth: HTTPAuthorizationCredentials = Depends(_auth),
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


@inject
async def get_auth_user(
    token: str = Depends(get_auth_token),
    session_repository: SessionRepository = Depends(
        Provide[AppContainer.auth.session_repository]
    ),
) -> ResourceId:
    use_case = GetSessionUser(token=token)
    handler = GetSessionUser.Handler(session_repository)
    user_id = await handler.execute(use_case)

    if not user_id:
        raise RequestException(
            "INVALID_TOKEN", "The session token is invalid.", status_code=400
        )

    return user_id
