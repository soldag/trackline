from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.schemas import GameOut
from trackline.games.use_cases.base import BaseHandler


class GetGame(AuthenticatedUseCase[GameOut]):
    game_id: ResourceId


@GetGame.register_handler
class Handler(BaseHandler[GetGame, GameOut]):
    async def execute(self, user_id: ResourceId, use_case: GetGame) -> GameOut:
        game = await self._get_game(use_case.game_id)
        self._assert_is_player(game, user_id)

        return GameOut.from_model(game)
