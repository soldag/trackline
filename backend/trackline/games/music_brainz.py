from typing import List, Sequence

from httpx import AsyncClient, HTTPError
from lucenequerybuilder import Q

from trackline.configuration import APP_CONTACT_EMAIL
from trackline.constants import APP_NAME, MUSICBRAINZ_MIN_SCORE
from trackline.core.utils.version import get_version


class MusicBrainzClient:
    def __init__(self) -> None:
        self._client = AsyncClient(
            base_url="https://musicbrainz.org/ws/2/",
            headers={"user-agent": self._get_user_agent()},
        )

    async def close(self) -> None:
        await self._client.aclose()

    async def get_release_year(self, artists: Sequence[str], title: str) -> int | None:
        query = Q("recording", title)
        for artist in artists:
            query &= Q("artist", artist)

        print(str(query))

        try:
            response = await self._client.get(
                "recording",
                params={"query": str(query), "limit": 100, "fmt": "json"},
            )
        except HTTPError:
            return None

        if response.status_code != 200:
            return None

        release_years: List[int] = []
        for recording in response.json().get("recordings", []):
            if recording["score"] < MUSICBRAINZ_MIN_SCORE:
                continue

            try:
                release_year = int(recording["first-release-date"][:4])
            except (KeyError, TypeError, ValueError):
                continue

            release_years.append(release_year)

        return min(release_years) if release_years else None

    def _get_user_agent(self):
        user_agent = APP_NAME

        app_version = get_version()
        if app_version:
            user_agent += f"/{app_version}"

        if APP_CONTACT_EMAIL:
            user_agent += f" ({APP_CONTACT_EMAIL})"

        return user_agent
