import asyncio
import logging
from collections import deque
from collections.abc import Iterable
from typing import NamedTuple

from fastapi import WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from injector import inject
from pydantic import BaseModel

from trackline.core.notifications.channel_manager import (
    NotificationChannel,
    NotificationChannelManager,
)
from trackline.core.notifications.notification import Notification

log = logging.getLogger(__name__)


class BufferedNotification(NamedTuple):
    channel_keys: list[tuple[str, ...]]
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
        self, channel_keys: Iterable[tuple[str, ...]], notification: Notification
    ) -> None:
        buffered_notification = BufferedNotification(
            channel_keys=list(channel_keys),
            notification=notification,
        )
        self._buffer.append(buffered_notification)

    async def flush(self) -> None:
        while self._buffer:
            channel_keys, notification = self._buffer.popleft()

            notification_type = type(notification)
            envelope = NotificationEnvelope[notification_type].for_notification(
                notification
            )

            channels = self._channel_manager.get_all(channel_keys)
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
