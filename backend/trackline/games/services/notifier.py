import asyncio
import logging
from collections import defaultdict
from collections.abc import Iterable
from contextlib import suppress
from typing import Any, Protocol, runtime_checkable

from fastapi import WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

from trackline.core.fields import ResourceId
from trackline.core.utils import to_snake_case
from trackline.games.models import Game

log = logging.getLogger(__name__)


class Notification(BaseModel):
    def get_type(self) -> str:
        return to_snake_case(self.__class__.__name__)


class NotificationEnvelope[NotificationT: Notification](BaseModel):
    type: str
    payload: NotificationT

    @classmethod
    def for_notification(
        cls,
        notification: NotificationT,
    ) -> "NotificationEnvelope[NotificationT]":
        return cls(type=notification.get_type(), payload=notification)


@runtime_checkable
class NotificationChannel(Protocol):
    async def send_json(self, data: Any) -> None:  # noqa: ANN401
        pass


class Notifier:
    def __init__(self) -> None:
        self._channels: dict[
            tuple[ResourceId, ResourceId],
            list[NotificationChannel],
        ] = defaultdict(list)

    def add_channel(
        self,
        game_id: ResourceId,
        player_id: ResourceId,
        channel: NotificationChannel,
    ) -> None:
        self._channels[game_id, player_id].append(channel)

    def remove_channel(self, channel: NotificationChannel) -> None:
        for channels in self._channels.values():
            with suppress(ValueError):
                channels.remove(channel)

    async def notify(
        self,
        user_id: ResourceId | None,
        game: Game,
        notification: Notification,
    ) -> None:
        if not game.id:
            raise ValueError("The game must have an id")
        recipient_ids = [p.user_id for p in game.players if p.user_id != user_id]
        if not recipient_ids:
            return

        notification_type = type(notification)
        envelope = NotificationEnvelope[
            notification_type  # type: ignore[valid-type]
        ].for_notification(notification)

        await self._send_multicast(game.id, recipient_ids, envelope)

    async def _send_multicast(
        self,
        game_id: ResourceId,
        player_ids: Iterable[ResourceId],
        envelope: NotificationEnvelope,
    ) -> None:
        channels: list[NotificationChannel] = []
        for player_id in player_ids:
            channels += self._channels.get((game_id, player_id), [])

        await asyncio.gather(*(self._send(channel, envelope) for channel in channels))

    async def _send(
        self,
        channel: NotificationChannel,
        envelope: NotificationEnvelope,
    ) -> None:
        try:
            await channel.send_json(jsonable_encoder(envelope))
        except WebSocketDisconnect:
            self.remove_channel(channel)
