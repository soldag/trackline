from injector import Inject
from pydantic import BaseModel

from trackline.core.exceptions import UseCaseException
from trackline.spotify.client import InvalidTokenException, SpotifyClient
from trackline.spotify.schemas import SpotifyAccessToken


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
                    code="INVALID_AUTH_TOKEN",
                    description="The refresh token is invalid.",
                    status_code=400,
                )

            return SpotifyAccessToken(
                access_token=access_token,
                refresh_token=refresh_token,
            )
