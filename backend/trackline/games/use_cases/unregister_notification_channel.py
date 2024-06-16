from injector import Inject
from pydantic import BaseModel, ConfigDict

from trackline.games.services.notifier import NotificationChannel, Notifier
from trackline.games.services.repository import GameRepository
from trackline.games.use_cases.base import BaseHandler


class UnregisterNotificationChannel(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    channel: NotificationChannel

    class Handler(BaseHandler):
        def __init__(
            self, game_repository: Inject[GameRepository], notifier: Inject[Notifier]
        ) -> None:
            super().__init__(game_repository)
            self._notifier = notifier

        async def execute(self, use_case: "UnregisterNotificationChannel") -> None:
            self._notifier.remove_channel(use_case.channel)
