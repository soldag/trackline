from injector import inject

from trackline.core.exceptions import UseCaseError
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase, AuthenticatedUseCaseHandler
from trackline.spotify.schemas import SpotifyAccessTokenOut
from trackline.spotify.services.auth_provider import (
    InvalidTokenError,
    SpotifyAuthProvider,
)


class RefreshAccessToken(AuthenticatedUseCase[SpotifyAccessTokenOut]):
    refresh_token: str


@RefreshAccessToken.register_handler
class Handler(AuthenticatedUseCaseHandler[RefreshAccessToken, SpotifyAccessTokenOut]):
    @inject
    def __init__(
        self,
        auth_provider: SpotifyAuthProvider,
    ) -> None:
        self._auth_provider = auth_provider

    async def execute(
        self, user_id: ResourceId, use_case: RefreshAccessToken
    ) -> SpotifyAccessTokenOut:
        try:
            token = await self._auth_provider.refresh_access_token(
                use_case.refresh_token,
            )
        except InvalidTokenError as e:
            raise UseCaseError(
                code="INVALID_SPOTIFY_REFRESH_TOKEN",
                message="The refresh token is invalid.",
                status_code=400,
            ) from e

        return SpotifyAccessTokenOut(
            access_token=token.access_token,
            refresh_token=token.refresh_token,
        )
