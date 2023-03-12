from pydantic import BaseModel

from trackline.games.notifier import NotificationChannel, Notifier
from trackline.games.repository import GameRepository
from trackline.games.use_cases.base import BaseHandler


class UnregisterNotificationChannel(BaseModel):
    channel: NotificationChannel

    class Config:
        arbitrary_types_allowed = True

    class Handler(BaseHandler):
        def __init__(self, game_repository: GameRepository, notifier: Notifier) -> None:
            super().__init__(game_repository)
            self._notifier = notifier

        async def execute(self, use_case: "UnregisterNotificationChannel") -> None:
            self._notifier.remove_channel(use_case.channel)
