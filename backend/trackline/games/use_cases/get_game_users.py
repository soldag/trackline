from beanie.operators import In
from pydantic import BaseModel

from trackline.core.fields import ResourceId
from trackline.games.use_cases.base import BaseHandler
from trackline.users.models import User
from trackline.users.schemas import UserOut


class GetGameUsers(BaseModel):
    game_id: ResourceId

    class Handler(BaseHandler):
        async def execute(
            self, user_id: ResourceId, use_case: "GetGameUsers"
        ) -> list[UserOut]:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)

            user_ids = [player.user_id for player in game.players]
            users = await User.find(
                In(User.id, user_ids),
                session=self._db.session,
            ).to_list()

            return [UserOut.from_model(user) for user in users]
