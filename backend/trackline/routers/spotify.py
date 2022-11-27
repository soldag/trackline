from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends

from trackline.ioc import Container
from trackline.schema.responses import EntityResponse
from trackline.schema.spotify import SpotifyAccessToken
from trackline.use_cases.spotify import GetSpotifyAccessToken, RefreshSpotifyAccessToken
from trackline.utils.deps import get_auth_user
from trackline.utils.responses import make_ok


router = APIRouter(
    prefix="/spotify",
    tags=["Spotify"],
)


@router.post("/access_token", response_model=EntityResponse[SpotifyAccessToken])
@inject
async def get_access_token(
    use_case: GetSpotifyAccessToken,
    auth_user_id: str = Depends(get_auth_user),
    handler: GetSpotifyAccessToken.Handler = Depends(
        Provide[Container.get_spotify_access_token_handler]
    ),
):
    user = await handler.execute(use_case)
    return make_ok(user)


@router.post("/access_token/refresh", response_model=EntityResponse[SpotifyAccessToken])
@inject
async def refresh_access_token(
    use_case: RefreshSpotifyAccessToken,
    auth_user_id: str = Depends(get_auth_user),
    handler: RefreshSpotifyAccessToken.Handler = Depends(
        Provide[Container.refresh_spotify_access_token_handler]
    ),
):
    user = await handler.execute(use_case)
    return make_ok(user)
