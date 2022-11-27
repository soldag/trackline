import asyncio
from collections import defaultdict
from typing import Any, Dict, List, Protocol, runtime_checkable, Sequence, Tuple

from trackline.models.games import Game
from trackline.schema.base import Notification
from trackline.utils import to_snake_case


@runtime_checkable
class NotificationChannel(Protocol):
    async def send_json(self, data: Any) -> None:
        pass


class Notifier:
    def __init__(self):
        self._channels: Dict[Tuple[str, str], List[NotificationChannel]] = defaultdict(
            list
        )

    def add_channel(
        self, game_id: str, player_id: str, channel: NotificationChannel
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
        user_id: str | None,
        game: Game,
        notification: Notification,
    ) -> None:
        if not game.id:
            raise ValueError("The game must have an id")
        recipient_ids = [p.user_id for p in game.players if p.user_id != user_id]
        if not recipient_ids:
            return

        payload = {
            "type": to_snake_case(notification.__class__.__name__),
            "payload": notification.dict(),
        }
        await self._send_multicast(game.id, recipient_ids, payload)

    async def _send_multicast(
        self, game_id: str, player_ids: Sequence[str], payload: Any
    ):
        await asyncio.gather(
            *(self._send(game_id, player_id, payload) for player_id in player_ids),
            return_exceptions=True,
        )

    async def _send(self, game_id: str, player_id: str, payload: Any):
        channels = self._channels.get((game_id, player_id))
        if not channels:
            raise ConnectionError(f"User {player_id} is not connected")

        await asyncio.gather(*(channel.send_json(payload) for channel in channels))
