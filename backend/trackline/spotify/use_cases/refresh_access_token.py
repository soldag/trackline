from injector import inject

from trackline.core.exceptions import UseCaseError
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase, AuthenticatedUseCaseHandler
from trackline.spotify.schemas import SpotifyAccessToken
from trackline.spotify.services.client import InvalidTokenError, SpotifyClient


class RefreshAccessToken(AuthenticatedUseCase[SpotifyAccessToken]):
    refresh_token: str


@RefreshAccessToken.register_handler
class Handler(AuthenticatedUseCaseHandler[RefreshAccessToken, SpotifyAccessToken]):
    @inject
    def __init__(self, spotify_client: SpotifyClient) -> None:
        self._spotify_client = spotify_client

    async def execute(
        self, user_id: ResourceId, use_case: RefreshAccessToken
    ) -> SpotifyAccessToken:
        try:
            (
                access_token,
                refresh_token,
            ) = await self._spotify_client.refresh_access_token(
                use_case.refresh_token,
            )
        except InvalidTokenError as e:
            raise UseCaseError(
                code="INVALID_SPOTIFY_REFRESH_TOKEN",
                message="The refresh token is invalid.",
                status_code=400,
            ) from e

        return SpotifyAccessToken(
            access_token=access_token,
            refresh_token=refresh_token,
        )
