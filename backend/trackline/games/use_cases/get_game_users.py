from typing import List

from pydantic import BaseModel

from trackline.core.fields import ResourceId
from trackline.games.repository import GameRepository
from trackline.games.use_cases.base import BaseHandler
from trackline.users.repository import UserRepository
from trackline.users.schemas import UserOut


class GetGameUsers(BaseModel):
    game_id: ResourceId

    class Handler(BaseHandler):
        def __init__(
            self,
            game_repository: GameRepository,
            user_repository: UserRepository,
        ) -> None:
            super().__init__(game_repository)
            self.user_repository = user_repository

        async def execute(
            self, user_id: ResourceId, use_case: "GetGameUsers"
        ) -> List[UserOut]:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)

            user_ids = [player.user_id for player in game.players]
            users = await self.user_repository.find_by_ids(user_ids)

            return [UserOut.from_model(user) for user in users]
