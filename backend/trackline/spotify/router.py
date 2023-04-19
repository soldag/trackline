from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends

from trackline.auth.deps import AuthUserDep
from trackline.core.ioc import AppContainer
from trackline.core.schemas import EntityResponse
from trackline.core.utils.response import make_ok
from trackline.spotify.schemas import SpotifyAccessToken
from trackline.spotify.use_cases import GetAccessToken, RefreshAccessToken


router = APIRouter(
    prefix="/spotify",
    tags=["Spotify"],
)


@router.post("/access_token", response_model=EntityResponse[SpotifyAccessToken])
@inject
async def get_access_token(
    use_case: GetAccessToken,
    auth_user_id: AuthUserDep,
    handler: GetAccessToken.Handler = Depends(
        Provide[AppContainer.spotify.get_access_token_handler]
    ),
):
    user = await handler.execute(use_case)
    return make_ok(user)


@router.post("/access_token/refresh", response_model=EntityResponse[SpotifyAccessToken])
@inject
async def refresh_access_token(
    use_case: RefreshAccessToken,
    auth_user_id: AuthUserDep,
    handler: RefreshAccessToken.Handler = Depends(
        Provide[AppContainer.spotify.refresh_access_token_handler]
    ),
):
    user = await handler.execute(use_case)
    return make_ok(user)
