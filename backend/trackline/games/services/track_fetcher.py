import logging
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
from trackline.spotify.services.spotify_client import SpotifyClient

log = logging.getLogger(__name__)


class PlaylistsExhaustedError(Exception):
    def __init__(self) -> None:
        super().__init__("All playlist tracks have been exhausted")


class TrackFetcher:
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

    async def fetch_tracks(
        self,
        playlists: Iterable[Playlist],
        count: int,
        market: str | None = None,
        exclude: Collection[str] | None = None,
    ) -> list[Track]:
        exclude = exclude or []

        # Build a flat list of (playlist_id, track_index) pairs so that each track,
        # regardless of which playlist it belongs to, has an equal chance of selection
        track_indices = [
            (playlist.spotify_id, index)
            for playlist in playlists
            for index in range(playlist.track_count)
        ]

        result: list[Track] = []
        for playlist_id, track_index in shuffle(track_indices):
            sp_track = await self._spotify_client.get_playlist_track(
                playlist_id,
                track_index,
                market=market,
            )
            if (
                not sp_track
                or not sp_track.is_playable
                or not sp_track.release_year
                or sp_track.id in exclude
            ):
                continue

            metadata = self._track_metadata_parser.parse(
                sp_track.artists, sp_track.title
            )
            release_year = await self._validate_release_year(sp_track, metadata)

            track = Track(
                spotify_id=sp_track.id,
                title=metadata.clean_title,
                artists=sp_track.artists,
                release_year=release_year,
                image_url=sp_track.image_url,
            )
            result.append(track)

            if len(result) == count:
                return result

        raise PlaylistsExhaustedError

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
