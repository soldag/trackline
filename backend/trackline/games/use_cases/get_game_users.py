from beanie.operators import In

from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.use_cases.base import BaseHandler
from trackline.users.models import User
from trackline.users.schemas import UserOut


class GetGameUsers(AuthenticatedUseCase[list[UserOut]]):
    game_id: ResourceId


@GetGameUsers.register_handler
class Handler(BaseHandler[GetGameUsers, list[UserOut]]):
    async def execute(
        self, user_id: ResourceId, use_case: GetGameUsers
    ) -> list[UserOut]:
        game = await self._get_game(use_case.game_id)
        self._assert_is_player(game, user_id)

        user_ids = [player.user_id for player in game.players]
        users = await self._repository.get_many(User, In(User.id, user_ids))

        return [UserOut.from_model(user) for user in users]
