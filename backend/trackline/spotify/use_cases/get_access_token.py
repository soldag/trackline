from injector import inject
from pydantic import BaseModel

from trackline.core.exceptions import UseCaseError
from trackline.spotify.schemas import SpotifyAccessToken
from trackline.spotify.services.client import InvalidTokenError, SpotifyClient

SPOTIFY_PRODUCT_PREMIUM = "premium"


class GetAccessToken(BaseModel):
    code: str

    class Handler:
        @inject
        def __init__(self, spotify_client: SpotifyClient) -> None:
            self._spotify_client = spotify_client

        async def execute(self, use_case: "GetAccessToken") -> SpotifyAccessToken:
            try:
                (
                    access_token,
                    refresh_token,
                ) = await self._spotify_client.get_access_token(use_case.code)
            except InvalidTokenError as e:
                raise UseCaseError(
                    code="INVALID_SPOTIFY_AUTH_CODE",
                    message="The authorization code is invalid.",
                    status_code=400,
                ) from e

            user = await self._spotify_client.get_current_user(access_token)
            if user.get("product") != SPOTIFY_PRODUCT_PREMIUM:
                raise UseCaseError(
                    code="UNSUPPORTED_SPOTIFY_PRODUCT",
                    message="Spotify Premium is required.",
                    status_code=400,
                )

            return SpotifyAccessToken(
                access_token=access_token,
                refresh_token=refresh_token,
            )
