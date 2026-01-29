import logging
import re
from collections.abc import Iterable
from dataclasses import replace
from functools import reduce

from injector import inject
from lucenequerybuilder import Q

from trackline.games.services.music_brainz_client import MusicBrainzClient, Recording
from trackline.games.services.track_metadata_parser import (
    ArtistType,
    TrackMetadata,
    TrackVersionType,
)
from trackline.games.utils import tokenize_string

log = logging.getLogger(__name__)


class MusicBrainzLookup:
    MAX_LIMIT = 100
    MIN_SIMILARITY_SCORE = 0.7
    SECONDARY_TITLE_PATTERN = r"\s*(\(.+?\)|\[.*?\])\s*"
    COMMENT_IGNORE_LIST = (
        # Exclude live recordings as they can result in the
        # actual initial recordings not show up in response
        "live",
    )
    MAIN_ARTIST_TYPES = (ArtistType.PRIMARY, ArtistType.SECONDARY)

    @inject
    def __init__(self, client: MusicBrainzClient) -> None:
        self._client = client

    async def get_release_year(self, metadata: TrackMetadata) -> int | None:
        for tokenize in (False, True):
            if release_year := await self._get_release_year(
                metadata, tokenize=tokenize
            ):
                return release_year

        main_artists = [
            a for a in metadata.artists if a.artist_type in self.MAIN_ARTIST_TYPES
        ]
        extra_artists = [
            a for a in metadata.artists if a.artist_type not in self.MAIN_ARTIST_TYPES
        ]
        if len(main_artists) > 1:
            metadata = replace(metadata, artists=(main_artists[0], *extra_artists))
            return await self.get_release_year(metadata)

        return None

    async def _get_release_year(
        self,
        metadata: TrackMetadata,
        *,
        tokenize: bool = False,
    ) -> int | None:
        queries: list[Q] = []
        for artist in metadata.artists:
            sub_query = self._build_query(artist.primary_name, tokenize=tokenize)
            for secondary_name in artist.secondary_names:
                sub_query |= self._build_query(secondary_name, tokenize=tokenize)
            queries.append(sub_query)

        queries.append(self._build_query(metadata.primary_title, tokenize=tokenize))
        queries += [
            self._build_query(secondary_title, tokenize=tokenize)
            for secondary_title in metadata.secondary_titles
        ]

        queries += [
            self._build_query(version.description, tokenize=tokenize)
            for version in metadata.versions
            if version.version_type == TrackVersionType.REMIX
        ]

        queries += [~Q("comment", text) for text in self.COMMENT_IGNORE_LIST]

        query = reduce(lambda q1, q2: q1 & q2, queries)
        recordings = await self._client.get_recordings(str(query), limit=self.MAX_LIMIT)

        return self._find_min_release_year(recordings, metadata)

    def _build_query(self, text: str, *, tokenize: bool = False) -> Q:
        if tokenize:
            # Fallback to raw text if tokenization results in empty set
            tokens = tokenize_string(text) or {text}
            sub_queries = [Q(t) for t in tokens]
            return reduce(lambda q1, q2: q1 & q2, sub_queries)

        return Q(text)

    def _find_min_release_year(
        self, recordings: Iterable[Recording], metadata: TrackMetadata
    ) -> int | None:
        for ignore_secondary_title in (False, True):
            release_years: list[int] = []
            for recording in recordings:
                if not recording.first_release_date:
                    continue

                if not self._validate_recording(
                    recording,
                    metadata,
                    ignore_secondary_title=ignore_secondary_title,
                ):
                    continue

                try:
                    release_year = int(recording.first_release_date[:4])
                except ValueError:
                    log.warning(
                        'Failed to parse year from "%s" from MusicBrainz response',
                        recording.first_release_date,
                    )
                else:
                    release_years.append(release_year)

            if release_years:
                return min(release_years)

        return None

    def _validate_recording(
        self,
        recording: Recording,
        metadata: TrackMetadata,
        *,
        ignore_secondary_title: bool,
    ) -> bool:
        has_valid_artists = self._validate_artists(recording, metadata)
        has_valid_title = self._validate_title(
            recording,
            metadata,
            ignore_secondary=ignore_secondary_title,
        )

        return has_valid_artists and has_valid_title

    def _validate_title(
        self,
        recording: Recording,
        expected_metadata: TrackMetadata,
        *,
        ignore_secondary: bool = False,
    ) -> bool:
        actual_titles: set[str] = set()
        if ignore_secondary:
            actual_titles.add(self._strip_secondary_title(recording.title))
        else:
            actual_titles.add(recording.title)
        # The track title in media might differ from the recording's title
        actual_titles.update(
            track.title
            for release in recording.releases
            for media in release.media
            for track in media.track
        )

        expected_tokens = tokenize_string(expected_metadata.primary_title)
        optional_tokens: set[str] = set()
        for version in expected_metadata.versions:
            if version.version_type == TrackVersionType.REMIX:
                expected_tokens |= tokenize_string(version.description)
            else:
                optional_tokens |= tokenize_string(version.description)
        if not ignore_secondary:
            for secondary_title in expected_metadata.secondary_titles:
                expected_tokens |= tokenize_string(secondary_title)

        score = max(
            self._score_similarity(
                tokenize_string(title), expected_tokens, optional_tokens
            )
            for title in actual_titles
        )

        return score >= self.MIN_SIMILARITY_SCORE

    def _validate_artists(
        self, recording: Recording, expected_metadata: TrackMetadata
    ) -> bool:
        actual_names: set[str] = set()
        for artist_credit in recording.artist_credit:
            actual_names.add(artist_credit.name)
            actual_names.add(artist_credit.artist.name)
            actual_names.update(a.name for a in artist_credit.artist.aliases)

        for artist in expected_metadata.artists:
            if artist.artist_type == ArtistType.REMIXER:
                continue

            expected_names = [artist.primary_name, *artist.secondary_names]
            score = max(
                self._score_similarity(
                    tokenize_string(actual_name),
                    tokenize_string(expected_name),
                )
                for expected_name in expected_names
                for actual_name in actual_names
            )
            if score < self.MIN_SIMILARITY_SCORE:
                return False

        return True

    def _score_similarity(
        self,
        actual_tokens: set[str],
        expected_tokens: set[str],
        optional_tokens: set[str] | None = None,
    ) -> float:
        if optional_tokens:
            expected_tokens |= actual_tokens & optional_tokens

        if not expected_tokens.issubset(actual_tokens):
            return 0

        expected_token_weights = sum(len(t) for t in expected_tokens)
        actual_token_weights = sum(len(t) for t in actual_tokens)
        if actual_token_weights == 0:
            return 0

        return expected_token_weights / actual_token_weights

    def _strip_secondary_title(self, title: str) -> str:
        return re.sub(self.SECONDARY_TITLE_PATTERN, "", title).strip()
