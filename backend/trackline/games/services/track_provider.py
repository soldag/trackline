import logging
from collections.abc import Iterable

from injector import inject

from trackline.core.background_tasks import BackgroundTaskManager
from trackline.games.models import Game, Track
from trackline.games.services.track_cache import TrackCache
from trackline.games.services.track_fetcher import PlaylistsExhaustedError, TrackFetcher
from trackline.games.use_cases.replenish_track_cache import ReplenishTrackCache

log = logging.getLogger(__name__)


class TrackProvider:
    @inject
    def __init__(
        self,
        track_cache: TrackCache,
        track_fetcher: TrackFetcher,
        background_task_manager: BackgroundTaskManager,
    ) -> None:
        self._track_cache = track_cache
        self._track_fetcher = track_fetcher
        self._background_task_manager = background_task_manager

    async def get_track(self, game: Game) -> Track:
        if tracks := await self.get_tracks(game, 1):
            return tracks[0]

        raise PlaylistsExhaustedError

    async def get_tracks(self, game: Game, count: int) -> list[Track]:
        if not game.id:
            raise ValueError("The game must have an id")

        exclude_ids = self._get_exclude_ids(game)
        result = [
            t
            for t in self._track_cache.pop_many(game.id, count)
            if t.spotify_id not in exclude_ids
        ]

        if tracks_to_fetch := count - len(result):
            log.warning(
                "Track cache miss for game %s: fetching %s/%s tracks from spotify.",
                game.id,
                tracks_to_fetch,
                count,
            )
            result += await self._track_fetcher.fetch_tracks(
                game.settings.playlists,
                tracks_to_fetch,
                exclude={*exclude_ids, *(t.spotify_id for t in result)},
                market=game.settings.spotify_market,
            )

        self.replenish_cache(
            game,
            exclude={t.spotify_id for t in result},
        )

        return result

    def replenish_cache(self, game: Game, exclude: Iterable[str] | None = None) -> None:
        if not game.id:
            raise ValueError("The game must have an id")

        self._background_task_manager.schedule(
            ReplenishTrackCache(
                game=game,
                exclude=frozenset({*(exclude or ()), *self._get_exclude_ids(game)}),
            )
        )

    def _get_exclude_ids(self, game: Game) -> set[str]:
        return {
            *(t.spotify_id for p in game.players for t in p.timeline),
            *(t.track.spotify_id for t in game.turns),
            *game.discarded_track_ids,
        }
