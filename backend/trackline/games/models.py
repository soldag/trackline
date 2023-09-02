import abc
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


class Guess(BaseModel, abc.ABC):
    creation_time: datetime = Field(default_factory=utcnow)
    token_cost: int


class ReleaseYearGuess(Guess):
    position: int
    year: int


class CreditsGuess(Guess):
    artists: list[str]
    title: str


class TurnPass(BaseModel):
    creation_time: datetime = Field(default_factory=utcnow)


class Scoring(BaseModel):
    winner: ResourceId | None
    correct_guesses: list[ResourceId]
    token_gain: dict[ResourceId, int]


class ReleaseYearScoring(BaseModel):
    position: Scoring
    year: Scoring


class CreditsScoring(Scoring):
    similarity_scores: dict[ResourceId, float]


class TurnScoring(BaseModel):
    release_year: ReleaseYearScoring
    credits: CreditsScoring


class TurnGuesses(BaseModel):
    release_year: dict[ResourceId, ReleaseYearGuess] = {}
    credits: dict[ResourceId, CreditsGuess] = {}


class Turn(BaseModel):
    creation_time: datetime = Field(default_factory=utcnow)
    active_user_id: ResourceId
    track: Track
    guesses: TurnGuesses = TurnGuesses()
    passes: dict[ResourceId, TurnPass] = {}
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
