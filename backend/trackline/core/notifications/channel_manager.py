from collections import defaultdict
from collections.abc import Collection, Iterable
from contextlib import suppress
from typing import Any, Protocol, runtime_checkable


@runtime_checkable
class NotificationChannel(Protocol):
    async def send_json(self, data: Any) -> None:  # noqa: ANN401
        pass


class NotificationChannelManager:
    def __init__(self) -> None:
        self._channels: dict[
            tuple[str, ...],
            list[NotificationChannel],
        ] = defaultdict(list)

    def register(self, key: tuple[str, ...], channel: NotificationChannel) -> None:
        self._channels[key].append(channel)

    def unregister(self, channel: NotificationChannel) -> None:
        for channels in self._channels.values():
            with suppress(ValueError):
                channels.remove(channel)

    def get(self, key: tuple[str, ...]) -> Collection[NotificationChannel]:
        return self._channels.get(key, [])

    def get_all(
        self, keys: Iterable[tuple[str, ...]]
    ) -> Collection[NotificationChannel]:
        return [channel for key in keys for channel in self.get(key)]
