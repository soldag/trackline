import logging

from injector import inject

from trackline.core.use_cases import AnonymousUseCase, AnonymousUseCaseHandler
from trackline.games.models import Game
from trackline.games.services.track_cache import TrackCache
from trackline.games.services.track_fetcher import TrackFetcher

log = logging.getLogger(__name__)


class ReplenishTrackCache(AnonymousUseCase):
    game: Game
    exclude: frozenset[str]


@ReplenishTrackCache.register_handler
class Handler(AnonymousUseCaseHandler["ReplenishTrackCache"]):
    @inject
    def __init__(self, track_cache: TrackCache, track_fetcher: TrackFetcher) -> None:
        self._track_cache = track_cache
        self._track_fetcher = track_fetcher

    async def execute(self, use_case: ReplenishTrackCache) -> None:
        if not use_case.game.id:
            return

        target_size = len(use_case.game.current_players) + 1
        current_size = self._track_cache.size(use_case.game.id)
        tracks_to_fetch = target_size - current_size
        if tracks_to_fetch <= 0:
            return

        tracks = await self._track_fetcher.fetch_tracks(
            use_case.game.settings.playlists,
            tracks_to_fetch,
            exclude=use_case.exclude,
            market=use_case.game.settings.spotify_market,
        )
        self._track_cache.add_many(use_case.game.id, tracks)

        log.debug(
            "Cache replenished for game %s: added %d track(s)",
            use_case.game.id,
            len(tracks),
        )
