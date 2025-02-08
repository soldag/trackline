from injector import Inject
from pydantic import BaseModel, ConfigDict

from trackline.core.db.client import DatabaseClient
from trackline.core.fields import ResourceId
from trackline.games.services.notifier import NotificationChannel, Notifier
from trackline.games.use_cases.base import BaseHandler


class RegisterNotificationChannel(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    game_id: ResourceId
    channel: NotificationChannel

    class Handler(BaseHandler):
        def __init__(
            self, db: Inject[DatabaseClient], notifier: Inject[Notifier]
        ) -> None:
            super().__init__(db)
            self._notifier = notifier

        async def execute(
            self, user_id: ResourceId, use_case: "RegisterNotificationChannel"
        ) -> None:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)

            self._notifier.add_channel(use_case.game_id, user_id, use_case.channel)
