from pydantic import BaseModel

from trackline.games.schemas import GameOut
from trackline.games.use_cases.base import BaseHandler


class GetGame(BaseModel):
    game_id: str

    class Handler(BaseHandler):
        async def execute(self, user_id: str, use_case: "GetGame") -> GameOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)

            return GameOut.from_model(game)
