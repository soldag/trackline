from pydantic import BaseModel

from trackline.core.fields import ResourceId
from trackline.games.notifier import NotificationChannel, Notifier
from trackline.games.repository import GameRepository
from trackline.games.use_cases.base import BaseHandler


class RegisterNotificationChannel(BaseModel):
    game_id: ResourceId
    channel: NotificationChannel

    class Config:
        arbitrary_types_allowed = True

    class Handler(BaseHandler):
        def __init__(self, game_repository: GameRepository, notifier: Notifier) -> None:
            super().__init__(game_repository)
            self._notifier = notifier

        async def execute(
            self, user_id: ResourceId, use_case: "RegisterNotificationChannel"
        ) -> None:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)

            self._notifier.add_channel(use_case.game_id, user_id, use_case.channel)
