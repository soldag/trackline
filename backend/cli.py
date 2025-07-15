import asyncio
import csv
import os
from collections.abc import Iterable, Mapping
from dataclasses import asdict
from io import StringIO
from typing import Annotated

import anyio
import typer
from injector import inject
from rich import print  # noqa: A004
from rich.pretty import pprint
from rich.table import Table

from trackline.di import injector
from trackline.games.services.music_brainz_lookup import MusicBrainzLookup
from trackline.games.services.track_metadata_parser import (
    TrackMetadata,
    TrackMetadataParser,
)
from trackline.spotify.models import SpotifyTrack
from trackline.spotify.services.client import SpotifyClient

app = typer.Typer()


class MusicbrainzTrackLookupCli:
    @inject
    def __init__(
        self,
        mb_lookup: MusicBrainzLookup,
        spotify_client: SpotifyClient,
        track_metadata_parser: TrackMetadataParser,
    ) -> None:
        self._mb_lookup = mb_lookup
        self._track_metadata_parser = track_metadata_parser
        self._spotify_client = spotify_client

    async def run(self, track_id: str) -> None:
        await self._spotify_client.initialize()
        try:
            track = await self._spotify_client.get_track(track_id)
        finally:
            await self._spotify_client.close()

        metadata = self._track_metadata_parser.parse(track.artists, track.title)
        mb_release_year = await self._mb_lookup.get_release_year(metadata)

        grid = Table.grid(padding=(0, 2))
        grid.add_row("Original title:", track.title)
        grid.add_row("Cleaned title:", metadata.clean_title)
        grid.add_row("Release year:", str(mb_release_year))
        print(grid)


class MusicbrainzPlaylistLookupCli:
    @inject
    def __init__(
        self,
        mb_lookup: MusicBrainzLookup,
        spotify_client: SpotifyClient,
        track_metadata_parser: TrackMetadataParser,
    ) -> None:
        self._mb_lookup = mb_lookup
        self._track_metadata_parser = track_metadata_parser
        self._spotify_client = spotify_client

    async def run(self, playlist_id: str, file_name: str) -> None:
        print(f"Fetching playlist {playlist_id} from Spotify...")
        await self._spotify_client.initialize()
        try:
            tracks = await self._spotify_client.get_playlist_tracks(playlist_id)
        finally:
            await self._spotify_client.close()

        buffer = StringIO()
        async with await anyio.open_file(file_name, "w") as csv_file:
            writer = csv.DictWriter(
                buffer,
                fieldnames=[
                    "id",
                    "spotify_artists",
                    "spotify_title",
                    "primary_title",
                    "secondary_titles",
                    "artists",
                    "version",
                    "spotify_release_year",
                    "mb_release_year",
                ],
            )
            writer.writeheader()

            for i, track in enumerate(tracks):
                print(f"Checking release year of track {i + 1}/{len(tracks)}...")

                metadata = self._track_metadata_parser.parse(track.artists, track.title)
                mb_release_year = await self._mb_lookup.get_release_year(metadata)

                writer.writerow(self._format_row(track, metadata, mb_release_year))
                await csv_file.write(buffer.getvalue())

                await asyncio.sleep(1)

    def _format_row(
        self, track: SpotifyTrack, metadata: TrackMetadata, mb_release_year: int | None
    ) -> Mapping[str, str]:
        formatted_artists: list[str] = []
        for artist in metadata.artists:
            result = artist.primary_name
            if artist.secondary_names:
                result += f" {self._format_iterable(artist.secondary_names)}"
            result += f" [{artist.artist_type}]"
            formatted_artists.append(result)

        return {
            "id": track.id,
            "spotify_artists": self._format_iterable(track.artists),
            "spotify_title": track.title,
            "primary_title": metadata.primary_title,
            "secondary_titles": self._format_iterable(metadata.secondary_titles),
            "artists": self._format_iterable(formatted_artists),
            "version": self._format_iterable(
                f"{version.description} ({version.version_type})"
                for version in metadata.versions
            ),
            "spotify_release_year": str(track.release_year),
            "mb_release_year": str(mb_release_year),
        }

    def _format_iterable(self, iterable: Iterable[str]) -> str:
        return ", ".join(iterable)


class TrackMetadataParserCli:
    @inject
    def __init__(
        self,
        spotify_client: SpotifyClient,
        track_metadata_parser: TrackMetadataParser,
    ) -> None:
        self._track_metadata_parser = track_metadata_parser
        self._spotify_client = spotify_client

    async def run(self, track_id: str) -> None:
        await self._spotify_client.initialize()
        try:
            track = await self._spotify_client.get_track(track_id)
        finally:
            await self._spotify_client.close()

        metadata = self._track_metadata_parser.parse(track.artists, track.title)

        print("Original information")
        pprint(track.model_dump())
        print()
        print("Parsed metadata")
        pprint(asdict(metadata))


@app.command()
def mb_track_lookup(track_id: str) -> None:
    """Lookup release year of a Spotify track on MusicBrainz."""
    cli = injector.get(MusicbrainzTrackLookupCli)
    asyncio.run(cli.run(track_id))


@app.command()
def mb_playlist_lookup(
    playlist_id: str,
    file_name: Annotated[str, typer.Option("-o")] = "results.csv",
) -> None:
    """Lookup release years of tracks of a Spotify playlist on MusicBrainz."""
    cli = injector.get(MusicbrainzPlaylistLookupCli)
    asyncio.run(cli.run(playlist_id, file_name))


@app.command()
def track_metadata(track_id: str) -> None:
    """Parse metadata of a Spotify track."""
    cli = injector.get(TrackMetadataParserCli)
    asyncio.run(cli.run(track_id))


def main() -> None:
    os.environ.setdefault("ENVIRONMENT", "development")
    app()


if __name__ == "__main__":
    main()
