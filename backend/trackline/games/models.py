from datetime import datetime
from enum import Enum

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
    artists: list[str]
    release_year: int
    image_url: str | None = None


class Player(BaseModel):
    user_id: ResourceId
    is_game_master: bool = False
    tokens: int = 0
    timeline: list[Track] = []


class Guess(BaseModel):
    creation_time: datetime = Field(default_factory=utcnow)
    position: int | None = None
    release_year: int | None = None


class CategoryScoring(BaseModel):
    winner: ResourceId | None = None
    tokens_delta: dict[ResourceId, int]


class TurnScoring(BaseModel):
    position: CategoryScoring
    release_year: CategoryScoring


class Turn(BaseModel):
    creation_time: datetime = Field(default_factory=utcnow)
    active_user_id: ResourceId
    track: Track
    guesses: dict[ResourceId, Guess] = {}
    scoring: TurnScoring | None = None
    completed_by: list[ResourceId] = []


class GameSettings(BaseModel):
    spotify_market: str
    playlist_ids: list[str]
    initial_tokens: int
    timeline_length: int
    guess_timeout: int


class Game(IdentifiableModel):
    creation_time: datetime = Field(default_factory=utcnow)
    completion_time: datetime | None = None
    settings: GameSettings
    state: GameState = GameState.WAITING_FOR_PLAYERS
    turns: list[Turn] = []
    players: list[Player] = []
    discarded_track_ids: list[str] = []

    def get_player(self, user_id: ResourceId) -> Player | None:
        return next((p for p in self.players if p.user_id == user_id), None)

    def get_active_player(self) -> Player | None:
        if not self.turns:
            return None

        active_user_id = self.turns[-1].active_user_id
        return self.get_player(active_user_id)
