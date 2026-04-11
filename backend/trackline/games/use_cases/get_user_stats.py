from datetime import datetime

from injector import inject

from trackline.core.db.repository import Repository
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.models import Game, GameState
from trackline.games.schemas import UserStatsOut
from trackline.games.services.game_stats_service import GameStatsService
from trackline.games.use_cases.base import BaseHandler


class GetUserStats(AuthenticatedUseCase[UserStatsOut]):
    min_timestamp: datetime | None = None
    max_timestamp: datetime | None = None


@GetUserStats.register_handler
class Handler(BaseHandler[GetUserStats, UserStatsOut]):
    @inject
    def __init__(
        self, repository: Repository, game_stats_service: GameStatsService
    ) -> None:
        super().__init__(repository)

        self._game_stats_service = game_stats_service

    async def execute(
        self, user_id: ResourceId, use_case: GetUserStats
    ) -> UserStatsOut:
        games = await self._repository.get_many(
            Game,
            {"players.user_id": user_id, "state": GameState.COMPLETED},
        )

        return self._game_stats_service.get_user_stats(games, user_id)
