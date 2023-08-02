from typing import Annotated

from fastapi import APIRouter
from fastapi_injector import Injected

from trackline.auth.deps import AuthUserId
from trackline.core.schemas import EntityResponse
from trackline.spotify.schemas import SpotifyAccessToken
from trackline.spotify.use_cases import GetAccessToken, RefreshAccessToken


router = APIRouter(
    prefix="/spotify",
    tags=["Spotify"],
)


@router.post("/access_token")
async def get_access_token(
    use_case: GetAccessToken,
    auth_user_id: AuthUserId,
    handler: Annotated[GetAccessToken.Handler, Injected(GetAccessToken.Handler)],
) -> EntityResponse[SpotifyAccessToken]:
    user = await handler.execute(use_case)
    return EntityResponse(data=user)


@router.post("/access_token/refresh")
async def refresh_access_token(
    use_case: RefreshAccessToken,
    auth_user_id: AuthUserId,
    handler: Annotated[
        RefreshAccessToken.Handler, Injected(RefreshAccessToken.Handler)
    ],
) -> EntityResponse[SpotifyAccessToken]:
    user = await handler.execute(use_case)
    return EntityResponse(data=user)
