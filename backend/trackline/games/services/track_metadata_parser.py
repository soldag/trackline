import re
from collections.abc import Collection, Iterable, Mapping, Sequence
from dataclasses import dataclass, replace
from enum import StrEnum


class ArtistType(StrEnum):
    PRIMARY = "primary"
    SECONDARY = "secondary"
    FEATURING = "featuring"
    REMIXER = "remixer"


class TrackVersionType(StrEnum):
    ORIGINAL = "original"
    REMASTER = "remaster"
    REMIX = "remix"
    LIVE = "live"
    MISC = "misc"


@dataclass(eq=True, frozen=True)
class Segment:
    text: str
    is_annotation: bool


@dataclass(eq=True, frozen=True)
class FeaturingPattern:
    value: str
    is_trusted: bool


@dataclass(eq=True, frozen=True)
class Artist:
    artist_type: ArtistType
    full_name: str
    primary_name: str
    secondary_names: tuple[str, ...]


@dataclass(eq=True, frozen=True)
class TrackVersion:
    version_type: TrackVersionType
    description: str
    artists: tuple[Artist, ...]


@dataclass(eq=True, frozen=True)
class TrackMetadata:
    artists: tuple[Artist, ...]
    full_title: str
    primary_title: str
    secondary_titles: tuple[str, ...]
    versions: tuple[TrackVersion, ...]

    @property
    def clean_title(self) -> str:
        clean_title = self.full_title
        for version in self.versions:
            clean_title = clean_title.replace(version.description, "")

        return re.sub(r"\s[\(\)\[\]\-/_ ]+$", " ", clean_title).strip()


class TrackMetadataParser:
    ARTIST_JOIN_PATTERN = r",(?:\s|$)(?:(?:and|und)\s)?|(?:^|\s)(?:and|und|&)(?:\s|$)"
    ARTIST_TYPE_PRIORITIES: Mapping[ArtistType, int] = {
        ArtistType.PRIMARY: 1,
        ArtistType.REMIXER: 2,
        ArtistType.FEATURING: 3,
        ArtistType.SECONDARY: 4,
    }
    SEGMENT_ANNOTATION_PATTERN = r"\(([^)]*)\)|\[([^\[]*)\]"
    SEGMENT_SEPARATOR_PATTERN = r" [\-/] |_"
    TRACK_VERSION_PATTERNS: Mapping[TrackVersionType, list[str]] = {
        TrackVersionType.ORIGINAL: [
            r"^((The|Das)\s+)?Original$",
            r"^((Original|Radio)\s+)?(Edit|Mix|Version)$",
        ],
        TrackVersionType.REMIX: [
            r"(.+)(\s|-)(Edit|Mix)",
            r"^(?P<artist>.+)\sRemix",
        ],
        TrackVersionType.REMASTER: [
            r"Remaster(ed)?",
        ],
        TrackVersionType.LIVE: [
            r"^Live",
        ],
        TrackVersionType.MISC: [
            r"Anniversary\s+Edition",
            r"Intro",
            r"^(Re-)?Recorded",
            r"(Theme\s+)?From\s+(.+)",
            r"(.+)Version",
        ],
    }
    FEATURING_PATTERNS: Collection[FeaturingPattern] = [
        FeaturingPattern(r"^with\s+(?P<artist>.+)", is_trusted=False),
        FeaturingPattern(r"feat(\.|uring)\s+(?P<artist>.+)", is_trusted=True),
    ]

    def parse(self, raw_artists: Sequence[str], raw_title: str) -> TrackMetadata:
        artists: list[Artist] = []
        primary_title: str = ""
        secondary_titles: list[str] = []
        versions: list[TrackVersion] = []

        for artist_index, raw_artist in enumerate(raw_artists):
            artist_type = (
                ArtistType.PRIMARY if artist_index == 0 else ArtistType.SECONDARY
            )
            artists.append(self._parse_artist(raw_artist, artist_type))

        for segment in self._split_in_segments(raw_title):
            text = segment.text

            if not primary_title and not segment.is_annotation:
                primary_title = text
                continue

            if featuring_artists := self._extract_featuring(text, artists):
                artists += featuring_artists
                continue

            if version := self._extract_version(text, artists):
                versions.append(version)
                continue

            secondary_titles.append(text)

        artists = self._deduplicate_artists(artists)

        return TrackMetadata(
            artists=tuple(artists),
            full_title=raw_title,
            primary_title=primary_title,
            secondary_titles=tuple(secondary_titles),
            versions=tuple(versions),
        )

    def _split_in_segments(self, text: str) -> list[Segment]:
        if not text.strip():
            return []

        segments: list[Segment] = []

        last_end = 0
        for match in re.finditer(self.SEGMENT_ANNOTATION_PATTERN, text):
            segments += self._split_in_segments(text[last_end : match.start()])
            last_end = match.end()

            if segment := match.group(1):
                segments.append(Segment(text=segment, is_annotation=True))

        remaining_text = text[last_end:]
        for segment in re.split(self.SEGMENT_SEPARATOR_PATTERN, remaining_text):
            if segment := segment.strip():
                segments.append(Segment(text=segment, is_annotation=False))

        return segments

    def _extract_featuring(
        self, segment: str, known_artists: Iterable[Artist]
    ) -> list[Artist]:
        artists: list[Artist] = []
        for pattern in self.FEATURING_PATTERNS:
            if match := self._search(pattern.value, segment):
                # Some patterns (e.g with <artist>) are not reliable, so we
                # double check if any of the extracted artists is already
                # known as an artist of the track
                match_artists = self._parse_artists(
                    match.group("artist"), ArtistType.FEATURING, known_artists
                )
                has_known_artist = any(
                    match_artist.full_name == known_artist.full_name
                    for match_artist in match_artists
                    for known_artist in known_artists
                )
                if pattern.is_trusted or has_known_artist:
                    artists += match_artists

        return artists

    def _extract_version(
        self, segment: str, known_artists: Iterable[Artist]
    ) -> TrackVersion | None:
        for version_type, patterns in self.TRACK_VERSION_PATTERNS.items():
            for match in self._search_all(patterns, segment):
                artists: list[Artist] = []
                if artist_name := match.groupdict().get("artist"):
                    artist_type = (
                        ArtistType.REMIXER
                        if version_type == TrackVersionType.REMIX
                        else ArtistType.SECONDARY
                    )
                    artists = self._parse_artists(
                        artist_name, artist_type, known_artists
                    )

                return TrackVersion(
                    version_type=version_type,
                    description=segment,
                    artists=tuple(artists),
                )

        return None

    def _parse_artist(self, text: str, artist_type: ArtistType) -> Artist:
        primary_name, *secondary_names = [s.text for s in self._split_in_segments(text)]

        return Artist(
            artist_type=artist_type,
            full_name=text,
            primary_name=primary_name,
            secondary_names=tuple(secondary_names),
        )

    def _parse_artists(
        self,
        text: str,
        artist_type: ArtistType,
        known_artists: Iterable[Artist],
    ) -> list[Artist]:
        artists: list[Artist] = []
        for artist in known_artists:
            if artist.primary_name in text:
                artists.append(replace(artist, artist_type=artist_type))
                for name in (artist.full_name, artist.primary_name):
                    text = text.replace(name, "").strip()

        matches = re.split(self.ARTIST_JOIN_PATTERN, text)

        # If there's only one match, it means the remaining string does not contain
        # any join phrase, so it's likely not another artist but rather some extra info
        if artists and len(matches) == 1:
            return artists

        for match in re.split(self.ARTIST_JOIN_PATTERN, text):
            if match and (name := match.strip()):
                artist = self._parse_artist(name, artist_type)
                artists.append(artist)

        return artists

    def _deduplicate_artists(self, artists: Iterable[Artist]) -> list[Artist]:
        seen: set[str] = set()
        result: list[Artist] = []

        for artist in sorted(
            artists, key=lambda a: self.ARTIST_TYPE_PRIORITIES[a.artist_type]
        ):
            if artist.full_name not in seen:
                result.append(artist)
                seen.add(artist.full_name)

        return result

    def _search(self, pattern: str, text: str) -> re.Match[str] | None:
        return re.search(pattern, text, re.IGNORECASE)

    def _search_all(self, patterns: Iterable[str], text: str) -> list[re.Match[str]]:
        return [match for pattern in patterns if (match := self._search(pattern, text))]
