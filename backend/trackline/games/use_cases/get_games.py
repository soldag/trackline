from typing import TYPE_CHECKING

from beanie import SortDirection

if TYPE_CHECKING:
    from trackline.core.db.repository import Query

from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.models import Game, GameState
from trackline.games.schemas import GameOut
from trackline.games.use_cases.base import BaseHandler


class GetGames(AuthenticatedUseCase[list[GameOut]]):
    state: list[GameState] | None = None


@GetGames.register_handler
class Handler(BaseHandler[GetGames, list[GameOut]]):
    async def execute(self, user_id: ResourceId, use_case: GetGames) -> list[GameOut]:
        query: Query = {"players.user_id": user_id}
        if use_case.state is not None:
            query["state"] = {"$in": use_case.state}

        games = await self._repository.get_many(
            Game,
            query,
            sort=[("creation_time", SortDirection.DESCENDING)],
            limit=25,
        )

        return [GameOut.from_model(game) for game in games]
