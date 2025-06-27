import logging
from collections.abc import Iterable
from functools import reduce

from injector import inject
from lucenequerybuilder import Q

from trackline.games.services.music_brainz_client import MusicBrainzClient

log = logging.getLogger(__name__)


class MusicBrainzLookup:
    LIMIT = 100
    MIN_SCORE = 70

    @inject
    def __init__(self, client: MusicBrainzClient) -> None:
        self._client = client

    async def get_release_year(self, artists: Iterable[str], title: str) -> int | None:
        sub_queries = (
            *(Q("artist", artist) for artist in artists),
            Q("recording", title),
        )
        query = reduce(lambda q1, q2: q1 & q2, sub_queries)

        recordings = await self._client.get_recordings(str(query), self.LIMIT)

        release_years: list[int] = []
        for recording in recordings:
            if recording.score < self.MIN_SCORE or not recording.first_release_date:
                continue

            try:
                release_year = int(recording.first_release_date[:4])
            except ValueError:
                log.warning(
                    'Failed to parse year from "%s" from MusicBrainz response',
                    recording.first_release_date,
                )
                continue

            release_years.append(release_year)

        return min(release_years) if release_years else None
