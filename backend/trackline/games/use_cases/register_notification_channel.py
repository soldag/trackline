from injector import inject
from pydantic import ConfigDict

from trackline.core.db.repository import Repository
from trackline.core.fields import ResourceId
from trackline.core.notifications import NotificationChannel
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.services.game_notifier import GameNotifier
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
        notifier: GameNotifier,
    ) -> None:
        super().__init__(repository)
        self._notifier = notifier

    async def execute(
        self, user_id: ResourceId, use_case: RegisterNotificationChannel
    ) -> None:
        game = await self._get_game(use_case.game_id)
        self._assert_is_player(game, user_id)

        self._notifier.register(use_case.game_id, user_id, use_case.channel)
