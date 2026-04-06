import abc
import asyncio
from collections.abc import Sequence
from types import TracebackType
from typing import Self

from fastapi import status
from httpx import AsyncClient
from httpx_retries import Retry, RetryTransport
from injector import inject

from trackline.core.settings import Settings
from trackline.spotify.models import SpotifyProduct, SpotifyTrack, SpotifyUser
from trackline.spotify.services.auth_provider import (
    AccessToken,
    RefreshableAccessToken,
    SpotifyAuthProvider,
)


class InvalidTokenError(Exception):
    def __init__(self) -> None:
        super().__init__("The specified authorization token is invalid")


class PlaylistNotFoundError(Exception):
    def __init__(self, playlist_id: str) -> None:
        super().__init__(f"The playlist {playlist_id} was not found")
        self.playlist_id = playlist_id


class SpotifyClientBase(abc.ABC):
    MAX_LIMIT = 50

    @inject
    def __init__(self, settings: Settings, auth_provider: SpotifyAuthProvider) -> None:
        self._settings = settings
        self._auth_provider = auth_provider

        self._client = AsyncClient(
            base_url="https://api.spotify.com/v1",
            transport=RetryTransport(
                retry=Retry(
                    total=settings.spotify_retries_max_attempts,
                    backoff_factor=settings.spotify_retries_min_interval / 1000,
                )
            ),
        )

    async def close(self) -> None:
        await self._client.aclose()

    async def get_track(self, track_id: str) -> SpotifyTrack:
        await self._ensure_access_token()

        response = await self._client.get(f"/tracks/{track_id}")
        response.raise_for_status()

        track = response.json()
        release_date = track["album"]["release_date"]
        is_playable = track.get("is_playable", True)

        try:
            release_year = int(release_date[:4])
        except TypeError, IndexError, ValueError:
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
        await self._ensure_access_token()

        response = await self._client.get(
            f"playlists/{playlist_id}",
            params={
                "fields": "tracks.total",
                "market": market,
            },
        )
        if response.status_code == status.HTTP_404_NOT_FOUND:
            raise PlaylistNotFoundError(playlist_id)
        response.raise_for_status()

        playlist = response.json()
        return playlist["tracks"]["total"]

    async def get_playlist_tracks(
        self,
        playlist_id: str,
        offset: int = 0,
        limit: int | None = None,
        market: str | None = None,
    ) -> list[SpotifyTrack]:
        await self._ensure_access_token()

        tracks: list[SpotifyTrack] = []
        while True:
            response = await self._client.get(
                f"playlists/{playlist_id}/items",
                params={
                    "fields": (
                        "items(track(id,is_playable,name,artists(name),album(release_date,images))),"
                        "total"
                    ),
                    "offset": str(offset),
                    "limit": str(limit - len(tracks) if limit else self.MAX_LIMIT),
                    "market": market,
                },
            )
            response.raise_for_status()

            response_body = response.json()
            items = response_body["items"]
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
                except TypeError, IndexError, ValueError:
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

            total = response_body["total"]
            if total <= len(tracks) or (limit and limit <= len(tracks)):
                break

            await self._sleep_throttle_time()

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

    async def __aenter__(self) -> Self:
        return self

    async def __aexit__(
        self,
        type_: type[BaseException] | None,
        value: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        await self.close()

    async def _ensure_access_token(self) -> None:
        access_token = await self._get_access_token()
        self._client.headers["Authorization"] = f"Bearer {access_token.access_token}"

    @abc.abstractmethod
    async def _get_access_token(self) -> AccessToken:
        raise NotImplementedError

    async def _sleep_throttle_time(self) -> None:
        await asyncio.sleep(self._settings.spotify_throttle_time / 1000)


class SpotifyClient(SpotifyClientBase):
    @inject
    def __init__(
        self,
        settings: Settings,
        auth_provider: SpotifyAuthProvider,
    ) -> None:
        super().__init__(settings, auth_provider)

        self._access_token: AccessToken | None = None

    async def _get_access_token(self) -> AccessToken:
        if not self._access_token or self._access_token.is_expired:
            self._access_token = await self._auth_provider.get_server_access_token()

        return self._access_token


class SpotifyUserClient(SpotifyClientBase):
    @inject
    def __init__(
        self,
        settings: Settings,
        auth_provider: SpotifyAuthProvider,
        access_token: RefreshableAccessToken,
    ) -> None:
        super().__init__(settings, auth_provider)

        self._access_token = access_token

    async def get_current_user(self) -> SpotifyUser:
        await self._ensure_access_token()

        response = await self._client.get("me")
        response.raise_for_status()

        user = response.json()
        user_product = user.get("product")

        return SpotifyUser(
            id=user["id"],
            product=SpotifyProduct(user_product) if user_product else None,
        )

    async def remove_tracks_from_playlist(
        self, playlist_id: str, track_ids: Sequence[str]
    ) -> None:
        """
        Remove multiple tracks from a Spotify playlist in batches of up to 100 items.
        """
        await self._ensure_access_token()

        for i in range(0, len(track_ids), self.MAX_LIMIT):
            track_ids_chunk = track_ids[i : i + self.MAX_LIMIT]
            response = await self._client.request(
                "DELETE",
                f"playlists/{playlist_id}/items",
                data={
                    "tracks": [
                        {"uri": f"spotify:track:{track_id}"}
                        for track_id in track_ids_chunk
                    ]
                },
            )
            response.raise_for_status()

            await self._sleep_throttle_time()

    async def _get_access_token(self) -> RefreshableAccessToken:
        if self._access_token.is_expired:
            refresh_token = self._access_token.refresh_token
            if not refresh_token:
                raise InvalidTokenError

            self._access_token = await self._auth_provider.refresh_access_token(
                refresh_token
            )

        return self._access_token
