from collections import OrderedDict, deque
from collections.abc import Iterable

from injector import inject

from trackline.core.fields import ResourceId
from trackline.core.settings import Settings
from trackline.games.models import Track


class TrackCache:
    @inject
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

        self._entries: OrderedDict[ResourceId, deque[Track]] = OrderedDict()
        self._total_size = 0

    def add(self, game_id: ResourceId, track: Track) -> None:
        self.add_many(game_id, (track,))

    def add_many(self, game_id: ResourceId, tracks: Iterable[Track]) -> None:
        if game_id not in self._entries:
            self._entries[game_id] = deque()
        else:
            self._entries.move_to_end(game_id)

        for track in tracks:
            self._entries[game_id].append(track)
            self._total_size += 1
            self._evict_if_needed()

    def pop(self, game_id: ResourceId) -> Track:
        game_entries = self._entries.get(game_id)
        if not game_entries or len(game_entries) == 0:
            raise KeyError("Track cache of this game is empty")

        track = game_entries.popleft()
        self._total_size -= 1
        if not game_entries:
            del self._entries[game_id]

        return track

    def pop_many(self, game_id: ResourceId, count: int) -> list[Track]:
        result: list[Track] = []
        while len(result) < count:
            try:
                result.append(self.pop(game_id))
            except KeyError:
                break

        return result

    def size(self, game_id: ResourceId) -> int:
        return len(self._entries.get(game_id, ()))

    def clear(self, game_id: ResourceId) -> None:
        if game_entries := self._entries.pop(game_id, None):
            self._total_size -= len(game_entries)

    def _evict_if_needed(self) -> None:
        while self._total_size > self._settings.track_cache_max_size:
            oldest_game_id = next(iter(self._entries))
            self.pop(oldest_game_id)
