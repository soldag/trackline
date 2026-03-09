from injector import ClassAssistedBuilder, inject

from trackline.core.exceptions import UseCaseError
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase, AuthenticatedUseCaseHandler
from trackline.spotify.models import SpotifyProduct
from trackline.spotify.schemas import SpotifyAccessTokenOut
from trackline.spotify.services.auth_provider import (
    InvalidTokenError,
    SpotifyAuthProvider,
)
from trackline.spotify.services.spotify_client import SpotifyUserClient


class GetAccessToken(AuthenticatedUseCase[SpotifyAccessTokenOut]):
    code: str


@GetAccessToken.register_handler
class Handler(AuthenticatedUseCaseHandler[GetAccessToken, SpotifyAccessTokenOut]):
    @inject
    def __init__(
        self,
        auth_provider: SpotifyAuthProvider,
        spotify_user_client_builder: ClassAssistedBuilder[SpotifyUserClient],
    ) -> None:
        self._auth_provider = auth_provider
        self._spotify_user_client_builder = spotify_user_client_builder

    async def execute(
        self, user_id: ResourceId, use_case: GetAccessToken
    ) -> SpotifyAccessTokenOut:
        try:
            token = await self._auth_provider.get_user_access_token(use_case.code)
        except InvalidTokenError as e:
            raise UseCaseError(
                code="INVALID_SPOTIFY_AUTH_CODE",
                message="The authorization code is invalid.",
                status_code=400,
            ) from e

        user_client = self._spotify_user_client_builder.build(access_token=token)

        user = await user_client.get_current_user()
        if user.product != SpotifyProduct.PREMIUM:
            raise UseCaseError(
                code="UNSUPPORTED_SPOTIFY_PRODUCT",
                message="Spotify Premium is required.",
                status_code=400,
            )

        return SpotifyAccessTokenOut(
            access_token=token.access_token,
            refresh_token=token.refresh_token,
        )
