from async_spotify import SpotifyApiClient
from async_spotify.authentification.authorization_flows import (
    AuthorizationCodeFlow,
    ClientCredentialsFlow,
)
from async_spotify.authentification.spotify_authorization_token import (
    SpotifyAuthorisationToken,
)
from async_spotify.spotify_errors import SpotifyError

from trackline.core.settings import Settings
from trackline.spotify.models import SpotifyTrack


class InvalidTokenException(Exception):
    def __init__(self, raw_error) -> None:
        super().__init__("The specified authorization token is invalid")
        self.raw_error = raw_error


class PlaylistNotFoundException(Exception):
    def __init__(self, playlist_id: str) -> None:
        super().__init__(f"The playlist {playlist_id} was not found")
        self.playlist_id = playlist_id


class SpotifyClient:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

        self._client = SpotifyApiClient(
            ClientCredentialsFlow(
                self._settings.spotify_client_id, self._settings.spotify_client_secret
            ),
            hold_authentication=True,
        )
        self._auth_client = SpotifyApiClient(
            AuthorizationCodeFlow(
                self._settings.spotify_client_id,
                self._settings.spotify_client_secret,
                redirect_url=self._settings.spotify_redirect_url,
            ),
        )

    async def initialize(self):
        await self._client.get_auth_token_with_client_credentials()
        await self._client.create_new_client()

    async def close(self):
        if self._client:
            await self._client.close_client()

    def get_auth_url(self):
        return self._auth_client.build_authorization_url()

    async def get_access_token(self, code: str) -> tuple[str, str]:
        try:
            token = await self._auth_client.get_auth_token_with_code(code)
        except SpotifyError as e:
            raise InvalidTokenException(e.message)

        return token.access_token, token.refresh_token

    async def refresh_access_token(self, refresh_token: str) -> tuple[str, str]:
        try:
            token = await self._auth_client.refresh_token(
                SpotifyAuthorisationToken(refresh_token=refresh_token)
            )
        except SpotifyError as e:
            raise InvalidTokenException(e.message)

        return token.access_token, token.refresh_token

    async def get_playlist_total_tracks(self, playlist_id: str) -> int:
        await self._get_auth_token_if_needed()

        playlist = await self._client.playlists.get_one(
            playlist_id,
            fields="tracks.total",
        )
        if not playlist:
            raise PlaylistNotFoundException(playlist_id)

        return playlist["tracks"]["total"]

    async def get_playlist_track(
        self, playlist_id: str, index: int, market: str | None = None
    ) -> SpotifyTrack | None:
        await self._get_auth_token_if_needed()

        params = {
            "fields": "items(track(id,is_playable,name,artists(name),album(release_date,images)))",
            "offset": index,
            "limit": 1,
        }
        if market:
            params["market"] = market
        response = await self._client.playlists.get_tracks(playlist_id, **params)

        items = response["items"]
        if not items:
            return None

        track = items[0]["track"]
        release_date = track["album"]["release_date"]
        is_playable = track.get("is_playable", True)

        try:
            release_year = int(release_date[:4])
        except (TypeError, IndexError, ValueError):
            release_year = None

        images = sorted(
            track["album"]["images"],
            key=lambda x: x["height"] * x["width"],
            reverse=True,
        )

        return SpotifyTrack(
            id=track["id"],
            title=track["name"],
            artists=[a["name"] for a in track["artists"]],
            release_year=release_year,
            is_playable=is_playable,
            image_url=images[0]["url"] if images else None,
        )

    async def _get_auth_token_if_needed(self) -> None:
        if (
            not self._client.spotify_authorization_token
            or not not self._client.spotify_authorization_token.valid
        ):
            await self._client.get_auth_token_with_client_credentials()
