from injector import Inject
from pydantic import BaseModel

from trackline.core.exceptions import UseCaseException
from trackline.spotify.schemas import SpotifyAccessToken
from trackline.spotify.services.client import InvalidTokenException, SpotifyClient


class RefreshAccessToken(BaseModel):
    refresh_token: str

    class Handler:
        def __init__(self, spotify_client: Inject[SpotifyClient]) -> None:
            self._spotify_client = spotify_client

        async def execute(self, use_case: "RefreshAccessToken") -> SpotifyAccessToken:
            try:
                (
                    access_token,
                    refresh_token,
                ) = await self._spotify_client.refresh_access_token(
                    use_case.refresh_token
                )
            except InvalidTokenException:
                raise UseCaseException(
                    code="INVALID_SPOTIFY_REFRESH_TOKEN",
                    message="The refresh token is invalid.",
                    status_code=400,
                )

            return SpotifyAccessToken(
                access_token=access_token,
                refresh_token=refresh_token,
            )
