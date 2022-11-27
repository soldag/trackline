from typing import Any, Type, TypeVar

from automapper import create_mapper

from trackline.models.games import (
    Game,
    GameSettings,
    GameState,
    Guess,
    Player,
    Track,
    Turn,
)
from trackline.schema.games import (
    GameOut,
    GameSettingsOut,
    GuessOut,
    PlayerOut,
    TrackOut,
    TurnOut,
)


T = TypeVar("T")


class Mapper:
    def __init__(self) -> None:
        self._mapper = create_mapper()

        self._configure_mapper()

    def map(self, src_obj: Any, target_cls: Type[T]) -> T:
        return self._mapper.to(target_cls).map(src_obj)

    def _configure_mapper(self) -> None:
        self._mapper.add(Game, GameOut)
        self._mapper.add(GameState, GameState)
        self._mapper.add(GameSettings, GameSettingsOut)
        self._mapper.add(Guess, GuessOut)
        self._mapper.add(Player, PlayerOut)
        self._mapper.add(Turn, TurnOut)
        self._mapper.add(Track, TrackOut)
