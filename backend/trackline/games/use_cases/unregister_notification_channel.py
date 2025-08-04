from injector import inject
from pydantic import ConfigDict

from trackline.core.db.repository import Repository
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.services.notifier import NotificationChannel, Notifier
from trackline.games.use_cases.base import BaseHandler


class UnregisterNotificationChannel(AuthenticatedUseCase):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    channel: NotificationChannel


@UnregisterNotificationChannel.register_handler
class Handler(BaseHandler[UnregisterNotificationChannel]):
    @inject
    def __init__(
        self,
        repository: Repository,
        notifier: Notifier,
    ) -> None:
        super().__init__(repository)
        self._notifier = notifier

    async def execute(
        self, user_id: ResourceId, use_case: UnregisterNotificationChannel
    ) -> None:
        self._notifier.remove_channel(use_case.channel)
