from collections.abc import Collection, Iterable

from injector import Inject

from trackline.core.utils import shuffle
from trackline.games.models import Playlist, Track
from trackline.games.services.music_brainz import MusicBrainzClient
from trackline.games.services.track_cleaner import TrackCleaner
from trackline.spotify.services.client import SpotifyClient


class TrackProvider:
    def __init__(
        self,
        spotify_client: Inject[SpotifyClient],
        music_brainz_client: Inject[MusicBrainzClient],
        track_cleaner: Inject[TrackCleaner],
    ) -> None:
        self._spotify_client = spotify_client
        self._music_brainz_client = music_brainz_client
        self._track_cleaner = track_cleaner

    async def get_random_tracks(
        self,
        playlists: Iterable[Playlist],
        count: int,
        market: str | None = None,
        exclude: Collection[str] | None = None,
    ) -> list[Track]:
        tracks: list[Track] = []
        exclude = list(exclude or [])
        while len(tracks) < count:
            track = await self.get_random_track(playlists, market, exclude)
            if not track:
                break

            tracks.append(track)
            exclude.append(track.spotify_id)

        return tracks

    async def get_random_track(
        self,
        playlists: Iterable[Playlist],
        market: str | None = None,
        exclude: Collection[str] | None = None,
    ) -> Track | None:
        exclude = exclude or []

        # Build a flat list of (playlist_id, track_index) pairs so that each track,
        # regardless of which playlist it belongs to, has an equal chance of selection
        track_indices = [
            (playlist.spotify_id, index)
            for playlist in playlists
            for index in range(playlist.track_count)
        ]

        for playlist_id, track_index in shuffle(track_indices):
            track = await self._spotify_client.get_playlist_track(
                playlist_id,
                track_index,
                market=market,
            )
            if (
                not track
                or not track.is_playable
                or not track.release_year
                or track.id in exclude
            ):
                continue

            clean_title = self._track_cleaner.cleanup_title(track.title)

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
