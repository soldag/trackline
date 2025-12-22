# pyright: reportUnknownVariableType=false
# pyright: reportUnknownParameterType=false
# pyright: reportUnknownMemberType=false
# pyright: reportUnknownArgumentType=false
# pyright: reportUnknownLambdaType=false

import asyncio
from collections.abc import AsyncIterator, Iterable, Sequence
from contextlib import asynccontextmanager
from typing import NotRequired, TypedDict

from async_spotify import SpotifyApiClient
from async_spotify.authentification.authorization_flows import (
    AuthorizationCodeFlow,
    ClientCredentialsFlow,
)
from async_spotify.authentification.spotify_authorization_token import (
    SpotifyAuthorisationToken,
)
from async_spotify.spotify_errors import SpotifyError
from injector import inject

from trackline.core.settings import Settings
from trackline.spotify.models import SpotifyProduct, SpotifyTrack, SpotifyUser


class GetPlaylistTracksParams(TypedDict):
    fields: Iterable[str]
    offset: int
    limit: int
    market: NotRequired[str]


class InvalidTokenError(Exception):
    def __init__(self) -> None:
        super().__init__("The specified authorization token is invalid")


class PlaylistNotFoundError(Exception):
    def __init__(self, playlist_id: str) -> None:
        super().__init__(f"The playlist {playlist_id} was not found")
        self.playlist_id = playlist_id


class SpotifyClient:
    MAX_LIMIT = 50
    REQUEST_THROTTLE_TIME = 0.2

    @inject
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

        self._client = SpotifyApiClient(
            ClientCredentialsFlow(
                self._settings.spotify_client_id,
                self._settings.spotify_client_secret,
            ),
            hold_authentication=True,
        )

    async def initialize(self) -> None:
        await self._client.get_auth_token_with_client_credentials()
        await self._client.create_new_client()

    async def close(self) -> None:
        if self._client:
            await self._client.close_client()

    def get_auth_url(self) -> str:
        return self._get_auth_client().build_authorization_url()

    async def get_access_token(self, code: str) -> tuple[str, str]:
        try:
            token = await self._get_auth_client().get_auth_token_with_code(code)
        except SpotifyError as e:
            raise InvalidTokenError from e

        return token.access_token, token.refresh_token

    async def refresh_access_token(self, refresh_token: str) -> tuple[str, str]:
        try:
            token = await self._get_auth_client().refresh_token(
                SpotifyAuthorisationToken(refresh_token=refresh_token),
            )
        except SpotifyError as e:
            raise InvalidTokenError from e

        return token.access_token, token.refresh_token

    async def get_current_user(self, access_token: str) -> SpotifyUser:
        async with self._get_user_client(access_token) as client:
            user = await client.user.me(
                SpotifyAuthorisationToken(access_token=access_token),
            )

            user_product = user.get("product")

            return SpotifyUser(
                id=user["id"],
                product=SpotifyProduct(user_product) if user_product else None,
            )

    async def get_track(self, track_id: str) -> SpotifyTrack:
        await self._get_auth_token_if_needed()

        track = await self._client.track.get_one(track_id)

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

    async def get_playlist_total_tracks(
        self,
        playlist_id: str,
        market: str | None = None,
    ) -> int:
        await self._get_auth_token_if_needed()

        playlist = await self._client.playlists.get_one(
            playlist_id,
            fields="tracks.total",
            market=market,
        )
        if not playlist:
            raise PlaylistNotFoundError(playlist_id)

        return playlist["tracks"]["total"]

    async def get_playlist_tracks(
        self,
        playlist_id: str,
        offset: int = 0,
        limit: int | None = None,
        market: str | None = None,
    ) -> list[SpotifyTrack]:
        await self._get_auth_token_if_needed()

        tracks: list[SpotifyTrack] = []
        while True:
            params: GetPlaylistTracksParams = {
                "fields": (
                    "items(track(id,is_playable,name,artists(name),album(release_date,images))),"
                    "total"
                ),
                "offset": offset,
                "limit": limit - len(tracks) if limit else self.MAX_LIMIT,
            }
            if market:
                params["market"] = market
            response = await self._client.playlists.get_tracks(playlist_id, **params)

            items = response["items"]
            if not items:
                break

            for item in items:
                track = item["track"]
                if track["id"] is None:
                    continue

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

                tracks.append(
                    SpotifyTrack(
                        id=track["id"],
                        title=track["name"],
                        artists=[a["name"] for a in track["artists"]],
                        release_year=release_year,
                        is_playable=is_playable,
                        image_url=images[0]["url"] if images else None,
                    ),
                )

            offset += len(items)
            if response["total"] <= len(tracks) or (limit and limit <= len(tracks)):
                break

            await asyncio.sleep(self.REQUEST_THROTTLE_TIME)

        return tracks

    async def get_playlist_track(
        self,
        playlist_id: str,
        index: int,
        market: str | None = None,
    ) -> SpotifyTrack | None:
        tracks = await self.get_playlist_tracks(
            playlist_id,
            offset=index,
            limit=1,
            market=market,
        )
        return tracks[0] if tracks else None

    async def remove_tracks_from_playlist(
        self, playlist_id: str, track_ids: Sequence[str], access_token: str
    ) -> None:
        """
        Remove multiple tracks from a Spotify playlist in batches of up to 100 items.
        """
        async with self._get_user_client(access_token) as client:
            for i in range(0, len(track_ids), self.MAX_LIMIT):
                track_ids_chunk = track_ids[i : i + self.MAX_LIMIT]
                await client.playlists.remove_tracks(
                    playlist_id,
                    {
                        "tracks": [
                            {"uri": f"spotify:track:{track_id}"}
                            for track_id in track_ids_chunk
                        ]
                    },
                    SpotifyAuthorisationToken(access_token=access_token),
                )
                await asyncio.sleep(self.REQUEST_THROTTLE_TIME)

    def _get_auth_client(
        self,
        auth_token: SpotifyAuthorisationToken | None = None,
    ) -> SpotifyApiClient:
        return SpotifyApiClient(
            AuthorizationCodeFlow(
                self._settings.spotify_client_id,
                self._settings.spotify_client_secret,
                redirect_url=self._settings.spotify_redirect_url,
            ),
            spotify_authorisation_token=auth_token,  # type: ignore[reportArgumentType]
        )

    @asynccontextmanager
    async def _get_user_client(
        self,
        access_token: str | None = None,
        refresh_token: str | None = None,
    ) -> AsyncIterator[SpotifyApiClient]:
        auth_token: SpotifyAuthorisationToken | None = None
        if access_token or refresh_token:
            auth_token = SpotifyAuthorisationToken(
                access_token=access_token,  # type: ignore[reportArgumentType]
                refresh_token=refresh_token,  # type: ignore[reportArgumentType]
            )

        client = self._get_auth_client(auth_token)
        await client.create_new_client()

        try:
            yield client
        finally:
            await client.close_client()

    async def _get_auth_token_if_needed(self) -> None:
        if (
            not self._client.spotify_authorization_token
            or self._client.spotify_authorization_token.valid
        ):
            await self._client.get_auth_token_with_client_credentials()
