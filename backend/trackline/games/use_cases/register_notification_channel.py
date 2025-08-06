from injector import inject
from pydantic import ConfigDict

from trackline.core.db.repository import Repository
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.services.notifications import (
    NotificationChannel,
    NotificationChannelManager,
)
from trackline.games.use_cases.base import BaseHandler


class RegisterNotificationChannel(AuthenticatedUseCase):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    game_id: ResourceId
    channel: NotificationChannel


@RegisterNotificationChannel.register_handler
class Handler(BaseHandler[RegisterNotificationChannel]):
    @inject
    def __init__(
        self,
        repository: Repository,
        channel_manager: NotificationChannelManager,
    ) -> None:
        super().__init__(repository)
        self._channel_manager = channel_manager

    async def execute(
        self, user_id: ResourceId, use_case: RegisterNotificationChannel
    ) -> None:
        game = await self._get_game(use_case.game_id)
        self._assert_is_player(game, user_id)

        self._channel_manager.register(use_case.game_id, user_id, use_case.channel)
