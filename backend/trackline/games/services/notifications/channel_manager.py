from collections import defaultdict
from collections.abc import Collection, Iterable
from contextlib import suppress
from typing import Any, Protocol, runtime_checkable

from trackline.core.fields import ResourceId


@runtime_checkable
class NotificationChannel(Protocol):
    async def send_json(self, data: Any) -> None:  # noqa: ANN401
        pass


class NotificationChannelManager:
    def __init__(self) -> None:
        self._channels: dict[
            tuple[ResourceId, ResourceId],
            list[NotificationChannel],
        ] = defaultdict(list)

    def register(
        self, game_id: ResourceId, player_id: ResourceId, channel: NotificationChannel
    ) -> None:
        self._channels[game_id, player_id].append(channel)

    def unregister(self, channel: NotificationChannel) -> None:
        for channels in self._channels.values():
            with suppress(ValueError):
                channels.remove(channel)

    def get_of_player(
        self, game_id: ResourceId, player_id: ResourceId
    ) -> Collection[NotificationChannel]:
        return self._channels.get((game_id, player_id), [])

    def get_of_players(
        self, game_id: ResourceId, player_ids: Iterable[ResourceId]
    ) -> Collection[NotificationChannel]:
        return [
            channel
            for player_id in player_ids
            for channel in self.get_of_player(game_id, player_id)
        ]
