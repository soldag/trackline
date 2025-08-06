import asyncio
import logging
from collections import deque
from typing import NamedTuple

from fastapi import WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from injector import inject
from pydantic import BaseModel

from trackline.core.fields import ResourceId
from trackline.games.models import Game
from trackline.games.services.notifications.channel_manager import (
    NotificationChannel,
    NotificationChannelManager,
)
from trackline.games.services.notifications.notification import Notification

log = logging.getLogger(__name__)


class BufferedNotification(NamedTuple):
    game_id: ResourceId
    recipient_ids: list[ResourceId]
    notification: Notification


class NotificationEnvelope[NotificationT: Notification](BaseModel):
    type: str
    payload: NotificationT

    @classmethod
    def for_notification(
        cls,
        notification: NotificationT,
    ) -> "NotificationEnvelope[NotificationT]":
        return cls(type=notification.get_type(), payload=notification)


class Notifier:
    @inject
    def __init__(self, channel_manager: NotificationChannelManager) -> None:
        self._channel_manager = channel_manager

        self._buffer: deque[BufferedNotification] = deque()

    async def notify(
        self, user_id: ResourceId, game: Game, notification: Notification
    ) -> None:
        if not game.id:
            raise ValueError("The game must have an id")

        recipient_ids = [p.user_id for p in game.players if p.user_id != user_id]
        if not recipient_ids:
            return

        buffered_notification = BufferedNotification(
            game_id=game.id,
            recipient_ids=recipient_ids,
            notification=notification,
        )
        self._buffer.append(buffered_notification)

    async def flush(self) -> None:
        while self._buffer:
            game_id, recipient_ids, notification = self._buffer.popleft()

            notification_type = type(notification)
            envelope = NotificationEnvelope[notification_type].for_notification(
                notification
            )

            channels = self._channel_manager.get_of_players(game_id, recipient_ids)
            await asyncio.gather(
                *(self._send(channel, envelope) for channel in channels)
            )

    def clear(self) -> None:
        self._buffer.clear()

    async def _send[NotificationT: Notification](
        self,
        channel: NotificationChannel,
        envelope: NotificationEnvelope[NotificationT],
    ) -> None:
        try:
            await channel.send_json(jsonable_encoder(envelope))
        except WebSocketDisconnect:
            self._channel_manager.unregister(channel)
