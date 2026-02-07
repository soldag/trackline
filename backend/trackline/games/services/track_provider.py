from collections.abc import Collection, Iterable

from injector import inject

from trackline.core.db.repository import Repository
from trackline.core.utils import shuffle
from trackline.games.models import Playlist, Track, TrackCorrection
from trackline.games.services.music_brainz_lookup import MusicBrainzLookup
from trackline.games.services.track_metadata_parser import (
    TrackMetadata,
    TrackMetadataParser,
)
from trackline.spotify.models import SpotifyTrack
from trackline.spotify.services.client import SpotifyClient


class TrackProvider:
    @inject
    def __init__(
        self,
        repository: Repository,
        spotify_client: SpotifyClient,
        music_brainz_lookup: MusicBrainzLookup,
        track_metadata_parser: TrackMetadataParser,
    ) -> None:
        self._repository = repository
        self._spotify_client = spotify_client
        self._music_brainz_lookup = music_brainz_lookup
        self._track_metadata_parser = track_metadata_parser

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

            metadata = self._track_metadata_parser.parse(track.artists, track.title)
            release_year = await self._validate_release_year(track, metadata)

            return Track(
                spotify_id=track.id,
                title=metadata.clean_title,
                artists=track.artists,
                release_year=release_year,
                image_url=track.image_url,
            )

        return None

    async def _validate_release_year(
        self,
        track: SpotifyTrack,
        metadata: TrackMetadata,
    ) -> int:
        if not track.release_year:
            raise ValueError("Track has no release year")

        # If the release year has been corrected before, use the corrected value
        correction = await self._repository.get_one(
            TrackCorrection, {"track_spotify_id": track.id}
        )
        if correction:
            return correction.release_year

        # Lookup release year on MusicBrainz and use the lower of the two values
        mb_release_year = await self._music_brainz_lookup.get_release_year(metadata)
        if mb_release_year is not None:
            return min(track.release_year, mb_release_year)

        return track.release_year
