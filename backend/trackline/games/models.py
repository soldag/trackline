import abc
from collections.abc import Mapping
from datetime import datetime
from enum import Enum
from typing import Self
from uuid import uuid4

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


class ArtistsMatchMode(str, Enum):
    ALL = "all"
    ONE = "one"


class TitleMatchMode(str, Enum):
    FULL = "full"
    MAIN = "main"


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


class TokenGain(BaseModel):
    refund: int = 0
    reward_theoretical: int = 0
    reward_effective: int = 0


class Scoring(BaseModel):
    winner: ResourceId | None
    correct_guesses: list[ResourceId]
    token_gains: dict[ResourceId, TokenGain]

    def with_token_gains(self, token_gains: Mapping[ResourceId, TokenGain]) -> Self:
        return self.model_copy(update=dict(token_gains=dict(token_gains)))


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
    revision_id: str = Field(default_factory=lambda: str(uuid4()))
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
    max_tokens: int
    timeline_length: int
    guess_timeout: int
    artists_match_mode: ArtistsMatchMode
    title_match_mode: TitleMatchMode
    credits_similarity_threshold: float


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
