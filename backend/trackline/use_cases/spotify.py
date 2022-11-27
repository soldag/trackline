from pydantic import BaseModel

from trackline.schema.spotify import SpotifyAccessToken
from trackline.services.spotify import InvalidTokenException, SpotifyService
from trackline.utils.exceptions import UseCaseException


class GetSpotifyAccessToken(BaseModel):
    code: str

    class Handler:
        def __init__(self, spotify_service: SpotifyService) -> None:
            self._spotify_service = spotify_service

        async def execute(
            self, use_case: "GetSpotifyAccessToken"
        ) -> SpotifyAccessToken:
            try:
                (
                    access_token,
                    refresh_token,
                ) = await self._spotify_service.get_access_token(use_case.code)
            except InvalidTokenException:
                raise UseCaseException(
                    code="INVALID_AUTH_TOKEN",
                    description="The authorization code is invalid.",
                    status_code=400,
                )

            return SpotifyAccessToken(
                access_token=access_token,
                refresh_token=refresh_token,
            )


class RefreshSpotifyAccessToken(BaseModel):
    refresh_token: str

    class Handler:
        def __init__(self, spotify_service: SpotifyService) -> None:
            self._spotify_service = spotify_service

        async def execute(
            self, use_case: "RefreshSpotifyAccessToken"
        ) -> SpotifyAccessToken:
            try:
                (
                    access_token,
                    refresh_token,
                ) = await self._spotify_service.refresh_access_token(
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
