from beanie import SortDirection

from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.models import Game, GameState
from trackline.games.schemas import GameOut
from trackline.games.use_cases.base import BaseHandler


class GetGames(AuthenticatedUseCase[list[GameOut]]):
    pass


@GetGames.register_handler
class Handler(BaseHandler[GetGames, list[GameOut]]):
    async def execute(self, user_id: ResourceId, use_case: GetGames) -> list[GameOut]:
        games = await self._repository.get_many(
            Game,
            {
                "players.user_id": user_id,
                "state": {"$ne": [GameState.ABORTED, GameState.COMPLETED]},
            },
            sort=[("creation_time", SortDirection.DESCENDING)],
        )

        return [GameOut.from_model(game) for game in games]
