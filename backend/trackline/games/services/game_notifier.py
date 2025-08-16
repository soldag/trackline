import logging

from injector import inject

from trackline.core.fields import ResourceId
from trackline.core.notifications import Notification, Notifier
from trackline.core.notifications.channel_manager import (
    NotificationChannel,
    NotificationChannelManager,
)
from trackline.games.models import Game

log = logging.getLogger(__name__)


class GameNotifier:
    @inject
    def __init__(
        self,
        channel_manager: NotificationChannelManager,
        notifier: Notifier,
    ) -> None:
        self._channel_manager = channel_manager
        self._notifier = notifier

    def register(
        self, game_id: ResourceId, player_id: ResourceId, channel: NotificationChannel
    ) -> None:
        key = self._get_channel_key(game_id, player_id)
        self._channel_manager.register(key, channel)

    def unregister(self, channel: NotificationChannel) -> None:
        self._channel_manager.unregister(channel)

    async def notify(
        self, user_id: ResourceId, game: Game, notification: Notification
    ) -> None:
        if not game.id:
            raise ValueError("The game must have an id")

        recipient_ids = [p.user_id for p in game.players if p.user_id != user_id]
        if not recipient_ids:
            return

        channel_keys = [
            self._get_channel_key(game.id, recipient_id)
            for recipient_id in recipient_ids
        ]

        await self._notifier.notify(channel_keys, notification)

    def _get_channel_key(
        self, game_id: ResourceId, user_id: ResourceId
    ) -> tuple[str, ...]:
        return (str(game_id), str(user_id))
