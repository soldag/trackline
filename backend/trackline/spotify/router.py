from typing import Annotated

from fastapi import APIRouter
from fastapi_injector import Injected

from trackline.auth.deps import AuthUserDep
from trackline.core.schemas import EntityResponse
from trackline.core.utils.response import make_ok
from trackline.spotify.schemas import SpotifyAccessToken
from trackline.spotify.use_cases import GetAccessToken, RefreshAccessToken


router = APIRouter(
    prefix="/spotify",
    tags=["Spotify"],
)


@router.post("/access_token", response_model=EntityResponse[SpotifyAccessToken])
async def get_access_token(
    use_case: GetAccessToken,
    auth_user_id: AuthUserDep,
    handler: Annotated[GetAccessToken.Handler, Injected(GetAccessToken.Handler)],
):
    user = await handler.execute(use_case)
    return make_ok(user)


@router.post("/access_token/refresh", response_model=EntityResponse[SpotifyAccessToken])
async def refresh_access_token(
    use_case: RefreshAccessToken,
    auth_user_id: AuthUserDep,
    handler: Annotated[
        RefreshAccessToken.Handler, Injected(RefreshAccessToken.Handler)
    ],
):
    user = await handler.execute(use_case)
    return make_ok(user)
