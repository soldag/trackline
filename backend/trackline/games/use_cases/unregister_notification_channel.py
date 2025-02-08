from injector import Inject
from pydantic import BaseModel, ConfigDict

from trackline.core.db.client import DatabaseClient
from trackline.games.services.notifier import NotificationChannel, Notifier
from trackline.games.use_cases.base import BaseHandler


class UnregisterNotificationChannel(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    channel: NotificationChannel

    class Handler(BaseHandler):
        def __init__(
            self, db: Inject[DatabaseClient], notifier: Inject[Notifier]
        ) -> None:
            super().__init__(db)
            self._notifier = notifier

        async def execute(self, use_case: "UnregisterNotificationChannel") -> None:
            self._notifier.remove_channel(use_case.channel)
