from typing import Annotated

from fastapi import APIRouter
from fastapi_injector import Injected

from trackline.auth.deps import AuthUserId
from trackline.core.schemas import EntityResponse
from trackline.core.use_cases import UseCaseExecutor
from trackline.spotify.schemas import SpotifyAccessToken
from trackline.spotify.use_cases import GetAccessToken, RefreshAccessToken

router = APIRouter(
    prefix="/spotify",
    tags=["Spotify"],
)


@router.post("/access_token")
async def get_access_token(
    auth_user_id: AuthUserId,
    use_case: GetAccessToken,
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[SpotifyAccessToken]:
    user = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=user)


@router.post("/access_token/refresh")
async def refresh_access_token(
    auth_user_id: AuthUserId,
    use_case: RefreshAccessToken,
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[SpotifyAccessToken]:
    user = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=user)
