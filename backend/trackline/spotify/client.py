from __future__ import annotations

import random
import re
from typing import Collection, List, Sequence, Tuple

from async_spotify import SpotifyApiClient
from async_spotify.authentification.authorization_flows import (
    AuthorizationCodeFlow,
    ClientCredentialsFlow,
)
from async_spotify.authentification.spotify_authorization_token import (
    SpotifyAuthorisationToken,
)
from async_spotify.spotify_errors import SpotifyError

from trackline.core.utils import shuffle
from trackline.games.models import Track


class InvalidTokenException(Exception):
    def __init__(self, raw_error) -> None:
        super().__init__("The specified authorization token is invalid")
        self.raw_error = raw_error


class PlaylistNotFoundException(Exception):
    def __init__(self, playlist_id: str) -> None:
        super().__init__(f"The playlist {playlist_id} was not found")
        self.playlist_id = playlist_id


class SpotifyClient:
    TITLE_CLEANUP_PATTERNS = (
        r" - \d+ Remaster(ed)?",
        r" - Remaster(ed)? \d+",
        r" - [^ ]+ Version",
    )

    def __init__(self, client_id: str, client_secret: str, redirect_url: str) -> None:
        self._client_id = client_id
        self._client_secret = client_secret

        self._client = SpotifyApiClient(
            ClientCredentialsFlow(self._client_id, self._client_secret),
            hold_authentication=True,
        )
        self._auth_client = SpotifyApiClient(
            AuthorizationCodeFlow(
                client_id,
                client_secret,
                redirect_url=redirect_url,
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

    async def get_access_token(self, code: str) -> Tuple[str, str]:
        try:
            token = await self._auth_client.get_auth_token_with_code(code)
        except SpotifyError as e:
            raise InvalidTokenException(e.message)

        return token.access_token, token.refresh_token

    async def refresh_access_token(self, refresh_token: str) -> Tuple[str, str]:
        try:
            token = await self._auth_client.refresh_token(
                SpotifyAuthorisationToken(refresh_token=refresh_token)
            )
        except SpotifyError as e:
            raise InvalidTokenException(e.message)

        return token.access_token, token.refresh_token

    async def get_random_track(
        self,
        playlist_ids: List[str],
        market: str | None = None,
        exclude: Collection[str] | None = None,
    ) -> Track | None:
        if (
            not self._client.spotify_authorization_token
            or not not self._client.spotify_authorization_token.valid
        ):
            await self._client.get_auth_token_with_client_credentials()

        # TODO: cache playlists?
        for playlist_id in shuffle(playlist_ids):
            playlist_id = random.choice(playlist_ids)
            playlist = await self._client.playlists.get_one(
                playlist_id,
                fields="tracks.total",
            )
            if not playlist:
                raise PlaylistNotFoundException(playlist_id)

            total_tracks = playlist["tracks"]["total"]
            track = await self._get_random_track_from_playlist(
                playlist_id, total_tracks, market, exclude
            )
            if track:
                return track

        return None

    async def get_random_tracks(
        self,
        playlist_ids: List[str],
        count: int,
        market: str | None = None,
        exclude: Collection[str] | None = None,
    ) -> Sequence[Track]:
        tracks: List[Track] = []
        exclude = list(exclude or [])
        while len(tracks) < count:
            track = await self.get_random_track(playlist_ids, market, exclude)
            if not track:
                break

            tracks.append(track)
            exclude.append(track.spotify_id)

        return tracks

    async def _get_random_track_from_playlist(
        self,
        playlist_id: str,
        total_tracks: int,
        market: str | None = None,
        exclude: Collection[str] | None = None,
    ) -> Track | None:
        for i in shuffle(list(range(total_tracks))):
            params = {
                "fields": "items(track(id,is_playable,name,artists(name),album(album_type,release_date,images)))",
                "offset": i,
                "limit": 1,
            }
            if market:
                params["market"] = market
            response = await self._client.playlists.get_tracks(playlist_id, **params)

            track = response["items"][0]["track"]
            album_type = track["album"]["album_type"]
            release_date = track["album"]["release_date"]
            if (
                (exclude and track["id"] in exclude)
                or track.get("is_playable") is False
                or album_type == "compilation"
                or not release_date
                or not len(release_date) >= 4
            ):
                continue

            images = sorted(
                track["album"]["images"],
                key=lambda x: x["height"] * x["width"],
                reverse=True,
            )

            return Track(
                spotify_id=track["id"],
                title=self._cleanup_title(track["name"]),
                artists=", ".join(a["name"] for a in track["artists"]),
                release_year=int(release_date[:4]),
                image_url=images[0]["url"] if images else None,
            )

        return None

    def _cleanup_title(self, title: str) -> str:
        for pattern in self.TITLE_CLEANUP_PATTERNS:
            title = re.sub(pattern, "", title)

        return title.strip()
