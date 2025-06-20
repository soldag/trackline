import logging
from collections.abc import Collection
from functools import reduce

from httpx import AsyncClient, HTTPError
from injector import Inject
from lucenequerybuilder import Q

from trackline.constants import APP_NAME, MUSICBRAINZ_MIN_SCORE
from trackline.core.settings import Settings
from trackline.core.utils.version import get_version

log = logging.getLogger(__name__)


class MusicBrainzClient:
    def __init__(self, settings: Inject[Settings]) -> None:
        self._settings = settings

        self._client = AsyncClient(
            base_url="https://musicbrainz.org/ws/2/",
            headers={"user-agent": self._get_user_agent()},
        )

    async def close(self) -> None:
        await self._client.aclose()

    async def get_release_year(
        self,
        artists: Collection[str],
        title: str,
    ) -> int | None:
        sub_queries = (
            *(Q("artist", artist) for artist in artists),
            Q("recording", title),
        )
        query = reduce(lambda q1, q2: q1 & q2, sub_queries)

        try:
            response = await self._client.get(
                "recording",
                params={"query": str(query), "limit": 100, "fmt": "json"},
            )
        except HTTPError:
            log.exception(
                "MusicBrainz request failed due to HTTP error",
            )
            return None

        if not response.is_success:
            log.exception(
                "MusicBrainz request failed with status code %s",
                response.status_code,
            )
            return None

        release_years: list[int] = []
        for recording in response.json().get("recordings", []):
            if recording["score"] < MUSICBRAINZ_MIN_SCORE:
                continue

            try:
                release_year = int(recording["first-release-date"][:4])
            except KeyError:
                continue
            except (TypeError, ValueError):
                log.warning(
                    "Failed to parse release year from MusicBrainz response",
                    exc_info=True,
                )
                continue

            release_years.append(release_year)

        return min(release_years) if release_years else None

    def _get_user_agent(self) -> str:
        user_agent = APP_NAME

        app_version = get_version()
        if app_version:
            user_agent += f"/{app_version}"

        if contact_email := self._settings.app_contact_email:
            user_agent += f" ({contact_email})"

        return user_agent
