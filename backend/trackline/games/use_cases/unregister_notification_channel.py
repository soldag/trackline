from injector import Inject
from pydantic import BaseModel, ConfigDict

from trackline.core.db.repository import Repository
from trackline.games.services.notifier import NotificationChannel, Notifier
from trackline.games.use_cases.base import BaseHandler


class UnregisterNotificationChannel(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    channel: NotificationChannel

    class Handler(BaseHandler):
        def __init__(
            self,
            repository: Inject[Repository],
            notifier: Inject[Notifier],
        ) -> None:
            super().__init__(repository)
            self._notifier = notifier

        async def execute(self, use_case: "UnregisterNotificationChannel") -> None:
            self._notifier.remove_channel(use_case.channel)
