import time
from dataclasses import dataclass
from typing import Literal, overload

from httpx import URL, AsyncClient, BasicAuth, Response
from injector import inject

from trackline.core.settings import Settings


@dataclass
class AccessToken:
    access_token: str
    expiration_time: int

    @property
    def is_expired(self) -> bool:
        return self.expiration_time <= time.time()


@dataclass
class RefreshableAccessToken(AccessToken):
    refresh_token: str


class InvalidTokenError(Exception):
    def __init__(self) -> None:
        super().__init__("The specified authorization token is invalid")


class SpotifyAuthProvider:
    AUTHORIZATION_URL = "https://accounts.spotify.com/authorize"
    TOKEN_URL = "https://accounts.spotify.com/api/token"  # noqa: S105

    @inject
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

        self._client = AsyncClient()

    async def close(self) -> None:
        await self._client.aclose()

    async def get_server_access_token(self) -> AccessToken:
        auth = BasicAuth(
            username=self._settings.spotify_client_id,
            password=self._settings.spotify_client_secret,
        )
        response = await self._client.post(
            self.TOKEN_URL,
            auth=auth,
            data={"grant_type": "client_credentials"},
        )
        response.raise_for_status()

        return self._parse_token_response(response)

    async def get_user_authorization_url(self) -> str:
        params = {
            "client_id": self._settings.spotify_client_id,
            "response_type": "code",
            "redirect_uri": self._settings.spotify_redirect_url,
        }
        url = URL(self.AUTHORIZATION_URL, params=params)
        return str(url)

    async def get_user_access_token(self, code: str) -> RefreshableAccessToken:
        response = await self._client.post(
            self.TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": self._settings.spotify_redirect_url,
                "client_id": self._settings.spotify_client_id,
                "client_secret": self._settings.spotify_client_secret,
            },
        )

        if response.is_client_error:
            raise InvalidTokenError
        response.raise_for_status()

        return self._parse_token_response(response, require_refresh_token=True)

    async def refresh_access_token(self, refresh_token: str) -> RefreshableAccessToken:
        response = await self._client.post(
            self.TOKEN_URL,
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": self._settings.spotify_client_id,
                "client_secret": self._settings.spotify_client_secret,
            },
        )

        if response.is_client_error:
            raise InvalidTokenError
        response.raise_for_status()

        return self._parse_token_response(response, refresh_token)

    @overload
    def _parse_token_response(self, response: Response) -> AccessToken: ...

    @overload
    def _parse_token_response(
        self,
        response: Response,
        refresh_token: str | None = None,
        *,
        require_refresh_token: Literal[True],
    ) -> RefreshableAccessToken: ...

    @overload
    def _parse_token_response(
        self,
        response: Response,
        refresh_token: str,
        *,
        require_refresh_token: bool = False,
    ) -> RefreshableAccessToken: ...

    def _parse_token_response(
        self,
        response: Response,
        refresh_token: str | None = None,
        *,
        require_refresh_token: bool = False,
    ) -> AccessToken | RefreshableAccessToken:
        data = response.json()
        access_token = data["access_token"]
        expiration_time = time.time() + data["expires_in"]
        refresh_token = data.get("refresh_token", refresh_token)

        if require_refresh_token and not refresh_token:
            raise ValueError("The response does not contain a refresh token")

        if refresh_token:
            return RefreshableAccessToken(access_token, expiration_time, refresh_token)

        return AccessToken(access_token, expiration_time)
