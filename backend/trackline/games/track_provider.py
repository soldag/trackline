from collections.abc import Collection, Sequence
import random
import re

from injector import Inject

from trackline.core.utils import shuffle
from trackline.games.models import Track
from trackline.games.music_brainz import MusicBrainzClient
from trackline.spotify.client import PlaylistNotFoundException, SpotifyClient


class TrackProvider:
    TITLE_CLEANUP_PATTERNS = (
        r" - From (.*)$",
        r" - The Original$",
        r" - [^-]*Remaster(ed)?(.*)$",
        r" - [^-]+ Edit(.*)$",
        r" - [^-]+ Remix(.*)$",
        r" - [^-]+ Version(.*)$",
        r" - [^-]+ Anniversary Edition(.*)$",
        r" \([^\)]+ Edit(.*)\)",
        r" \([^\)]+ Mix(.*)\)",
        r" \([^\)]+ Remix(.*)\)",
        r" \([^\)]+ Version(.*)\)",
        r" [\(\[]feat\. [^)]+[\)\]]",
    )

    def __init__(
        self,
        spotify_client: Inject[SpotifyClient],
        music_brainz_client: Inject[MusicBrainzClient],
    ) -> None:
        self._spotify_client = spotify_client
        self._music_brainz_client = music_brainz_client

    async def get_random_tracks(
        self,
        playlist_ids: Sequence[str],
        count: int,
        market: str | None = None,
        exclude: Collection[str] | None = None,
    ) -> list[Track]:
        tracks: list[Track] = []
        exclude = list(exclude or [])
        while len(tracks) < count:
            track = await self.get_random_track(playlist_ids, market, exclude)
            if not track:
                break

            tracks.append(track)
            exclude.append(track.spotify_id)

        return tracks

    async def get_random_track(
        self,
        playlist_ids: Sequence[str],
        market: str | None = None,
        exclude: Collection[str] | None = None,
    ) -> Track | None:
        # TODO: cache playlists?
        for playlist_id in shuffle(playlist_ids):
            playlist_id = random.choice(playlist_ids)
            try:
                total_tracks = await self._spotify_client.get_playlist_total_tracks(
                    playlist_id
                )
            except PlaylistNotFoundException:
                continue

            for index in shuffle(list(range(total_tracks))):
                track = await self._spotify_client.get_playlist_track(
                    playlist_id,
                    index,
                    market=market,
                )
                if (
                    not track
                    or not track.is_playable
                    or not track.release_year
                    or (exclude and track.id in exclude)
                ):
                    continue

                clean_title = self._cleanup_title(track.title)

                mb_release_year = await self._music_brainz_client.get_release_year(
                    track.artists,
                    clean_title,
                )
                if mb_release_year is not None:
                    release_year = min(track.release_year, mb_release_year)
                else:
                    release_year = track.release_year

                return Track(
                    spotify_id=track.id,
                    title=clean_title,
                    artists=track.artists,
                    release_year=release_year,
                    image_url=track.image_url,
                )

        return None

    def _cleanup_title(self, title: str) -> str:
        for pattern in self.TITLE_CLEANUP_PATTERNS:
            title = re.sub(pattern, "", title, flags=re.IGNORECASE)

        return title.strip()
