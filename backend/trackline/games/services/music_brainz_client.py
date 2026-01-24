import logging
from typing import Annotated

from httpx import AsyncClient, HTTPError
from injector import Inject
from pydantic import BaseModel, ConfigDict, Field

from trackline.constants import APP_NAME
from trackline.core.settings import Settings
from trackline.core.utils.version import get_version

log = logging.getLogger(__name__)


class MusicBrainzModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=lambda field_name: field_name.replace("_", "-")
    )


class ArtistAlias(MusicBrainzModel):
    name: str


class Artist(MusicBrainzModel):
    id: str
    name: str
    aliases: Annotated[list[ArtistAlias], Field(default_factory=list)]


class ArtistCredit(MusicBrainzModel):
    name: str
    artist: Artist


class ReleaseGroup(MusicBrainzModel):
    id: str
    primary_type: str | None = None
    secondary_types: Annotated[list[str], Field(default_factory=list)]


class Track(MusicBrainzModel):
    id: str
    title: str


class ReleaseMedia(MusicBrainzModel):
    id: str
    track: list[Track]


class Release(MusicBrainzModel):
    release_group: ReleaseGroup
    media: list[ReleaseMedia]


class Recording(MusicBrainzModel):
    id: str
    score: int
    title: str
    disambiguation: str | None = None
    artist_credit: Annotated[list[ArtistCredit], Field(default_factory=list)]
    releases: Annotated[list[Release], Field(default_factory=list)]
    first_release_date: str | None = None


class MusicBrainzClient:
    def __init__(self, settings: Inject[Settings]) -> None:
        self._settings = settings
        self._client = AsyncClient(
            base_url="https://musicbrainz.org/ws/2/",
            headers={"user-agent": self._get_user_agent()},
        )

    async def close(self) -> None:
        await self._client.aclose()

    async def get_recordings(
        self, query: str, limit: int | None = None
    ) -> list[Recording]:
        try:
            response = await self._client.get(
                "recording",
                params={"query": query, "limit": limit, "fmt": "json"},
            )
        except HTTPError:
            log.exception("MusicBrainz request failed due to HTTP error")
            return []

        if not response.is_success:
            log.exception(
                "MusicBrainz request failed with status code %s",
                response.status_code,
            )
            return []

        try:
            items = response.json().get("recordings", [])
            return [Recording.model_validate(item) for item in items]
        except ValueError:
            log.exception("Failed to parse MusicBrainz response")
            return []

    def _get_user_agent(self) -> str:
        user_agent = APP_NAME

        app_version = get_version()
        if app_version:
            user_agent += f"/{app_version}"

        if contact_email := self._settings.app_contact_email:
            user_agent += f" ({contact_email})"

        return user_agent
