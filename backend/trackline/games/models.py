from datetime import datetime
from enum import Enum
from typing import Dict, List

from pydantic import Field

from trackline.core.db.models import BaseModel, IdentifiableModel
from trackline.core.fields import ResourceId
from trackline.core.utils.datetime import utcnow


class GameState(str, Enum):
    WAITING_FOR_PLAYERS = "waiting_for_players"
    STARTED = "started"
    GUESSING = "guessing"
    SCORING = "scoring"
    COMPLETED = "completed"
    ABORTED = "aborted"


class Track(BaseModel):
    spotify_id: str
    title: str
    artists: str
    release_year: int
    image_url: str | None


class Player(BaseModel):
    user_id: ResourceId
    is_game_master: bool = False
    tokens: int = 0
    timeline: List[Track] = []


class Guess(BaseModel):
    creation_time: datetime = Field(default_factory=utcnow)
    position: int | None = None
    release_year: int | None = None


class CategoryScoring(BaseModel):
    winner: str | None
    tokens_delta: Dict[ResourceId, int]


class TurnScoring(BaseModel):
    position: CategoryScoring
    release_year: CategoryScoring


class Turn(BaseModel):
    creation_time: datetime = Field(default_factory=utcnow)
    active_user_id: ResourceId
    track: Track
    guesses: Dict[ResourceId, Guess] = {}
    scoring: TurnScoring | None
    completed_by: List[str] = []


class GameSettings(BaseModel):
    spotify_market: str
    playlist_ids: List[str]
    initial_tokens: int
    timeline_length: int
    guess_timeout: int


class Game(IdentifiableModel):
    creation_time: datetime = Field(default_factory=utcnow)
    settings: GameSettings
    state: GameState = GameState.WAITING_FOR_PLAYERS
    turns: List[Turn] = []
    players: List[Player] = []
    discarded_track_ids: List[str] = []

    def get_player(self, user_id: ResourceId) -> Player | None:
        return next((p for p in self.players if p.user_id == user_id), None)

    def get_active_player(self) -> Player | None:
        if not self.turns:
            return None

        active_user_id = self.turns[-1].active_user_id
        return self.get_player(active_user_id)
