from datetime import datetime
from typing import List, Mapping

from pydantic import BaseModel

from trackline.models.games import GameState
from trackline.schema.base import Notification
from trackline.schema.users import UserOut


class TrackOut(BaseModel):
    spotify_id: str
    title: str
    artists: str
    release_year: int
    image_url: str | None


class PlayerOut(BaseModel):
    user_id: str
    is_game_master: bool
    tokens: int
    timeline: List[TrackOut]


class GuessOut(BaseModel):
    timestamp: datetime
    position: int | None
    release_year: int | None


class TurnOut(BaseModel):
    active_user_id: str
    track: TrackOut
    guesses: Mapping[str, GuessOut]


class GameSettingsOut(BaseModel):
    spotify_market: str
    playlist_ids: List[str]


class GameOut(BaseModel):
    id: str
    settings: GameSettingsOut
    state: GameState
    turns: List[TurnOut]
    players: List[PlayerOut]


class TurnScoringOut(BaseModel):
    tokens: Mapping[str, int]


class PlayerJoined(Notification):
    user: UserOut
    player: PlayerOut


class PlayerLeft(Notification):
    user_id: str


class GameStarted(Notification):
    initial_tracks: Mapping[str, TrackOut]


class GameAborted(Notification):
    pass


class NewTurn(Notification):
    turn: TurnOut


class NewGuess(Notification):
    user_id: str
    guess: GuessOut


class TurnScored(Notification):
    scoring: TurnScoringOut
    game_completed: bool
