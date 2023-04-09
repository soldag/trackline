import asyncio
from collections import defaultdict
from typing import Any, Dict, List, Protocol, runtime_checkable, Sequence, Tuple

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

from trackline.core.fields import ResourceId
from trackline.core.utils import to_snake_case
from trackline.games.models import Game


class Notification(BaseModel):
    def get_type(self):
        return to_snake_case(self.__class__.__name__)


class NotificationEnvelope(BaseModel):
    type: str
    payload: Notification

    class Config:
        json_encoders = {ResourceId: str}

    @staticmethod
    def for_notification(notification: Notification) -> "NotificationEnvelope":
        return NotificationEnvelope(type=notification.get_type(), payload=notification)


@runtime_checkable
class NotificationChannel(Protocol):
    async def send_json(self, data: Any) -> None:
        pass


class Notifier:
    def __init__(self):
        self._channels: Dict[
            Tuple[ResourceId, ResourceId], List[NotificationChannel]
        ] = defaultdict(list)

    def add_channel(
        self, game_id: ResourceId, player_id: ResourceId, channel: NotificationChannel
    ) -> None:
        self._channels[game_id, player_id].append(channel)

    def remove_channel(self, channel: NotificationChannel) -> None:
        for channels in self._channels.values():
            try:
                channels.remove(channel)
            except ValueError:
                pass

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

        envelope = NotificationEnvelope.for_notification(notification)
        await self._send_multicast(game.id, recipient_ids, envelope)

    async def _send_multicast(
        self,
        game_id: ResourceId,
        player_ids: Sequence[ResourceId],
        envelope: NotificationEnvelope,
    ):
        await asyncio.gather(
            *(self._send(game_id, player_id, envelope) for player_id in player_ids),
            return_exceptions=True,
        )

    async def _send(
        self, game_id: ResourceId, player_id: ResourceId, envelope: NotificationEnvelope
    ):
        channels = self._channels.get((game_id, player_id))
        if not channels:
            raise ConnectionError(f"User {player_id} is not connected")

        await asyncio.gather(
            *(channel.send_json(jsonable_encoder(envelope)) for channel in channels)
        )
