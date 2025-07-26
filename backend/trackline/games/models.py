import abc
from datetime import UTC, datetime
from enum import Enum
from uuid import uuid4

from pydantic import BaseModel, Field

from trackline.core.db.models import BaseDocument
from trackline.core.fields import ResourceId
from trackline.core.utils.datetime import utcnow


class GameState(str, Enum):
    WAITING_FOR_PLAYERS = "waiting_for_players"
    STARTED = "started"
    GUESSING = "guessing"
    SCORING = "scoring"
    COMPLETED = "completed"
    ABORTED = "aborted"


class CorrectionProposalState(str, Enum):
    VOTING = "VOTING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


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
    timeline: list[Track] = Field(default_factory=list[Track])

    def add_to_timeline(self, track: Track) -> None:
        index = next(
            (
                i
                for i, timeline_track in enumerate(self.timeline)
                if timeline_track.release_year > track.release_year
            ),
            len(self.timeline),
        )
        self.timeline.insert(index, track)


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


class CorrectionProposalVote(BaseModel):
    agree: bool
    creation_time: datetime = Field(default_factory=utcnow)


class CorrectionProposal(BaseModel):
    created_by: ResourceId
    creation_time: datetime = Field(default_factory=utcnow)
    state: CorrectionProposalState = CorrectionProposalState.VOTING
    release_year: int
    votes: dict[ResourceId, CorrectionProposalVote] = {}


class Turn(BaseModel):
    revision_id: str = Field(default_factory=lambda: str(uuid4()))
    creation_time: datetime = Field(default_factory=utcnow)
    active_user_id: ResourceId
    track: Track
    guesses: TurnGuesses = TurnGuesses()
    passes: dict[ResourceId, TurnPass] = {}
    scoring: TurnScoring | None = None
    correction_proposal: CorrectionProposal | None = None
    completed_by: list[ResourceId] = Field(default_factory=list[ResourceId])


class Playlist(BaseModel):
    spotify_id: str
    track_count: int


class GameSettings(BaseModel):
    spotify_market: str
    playlists: list[Playlist]
    initial_tokens: int
    max_tokens: int
    timeline_length: int
    guess_timeout: int
    artists_match_mode: ArtistsMatchMode
    title_match_mode: TitleMatchMode
    credits_similarity_threshold: float


class Game(BaseDocument):
    creation_time: datetime = Field(default_factory=utcnow)
    completion_time: datetime | None = None
    settings: GameSettings
    state: GameState = GameState.WAITING_FOR_PLAYERS
    turns: list[Turn] = Field(default_factory=list[Turn])
    players: list[Player] = Field(default_factory=list[Player])
    discarded_track_ids: list[str] = Field(default_factory=list[str])

    def get_player(self, user_id: ResourceId) -> Player:
        try:
            return next(p for p in self.players if p.user_id == user_id)
        except StopIteration as e:
            raise ValueError("Player not found") from e

    def get_active_player(self) -> Player | None:
        if not self.turns:
            return None

        active_user_id = self.turns[-1].active_user_id
        return self.get_player(active_user_id)

    def get_next_player(self) -> Player:
        if not self.players:
            raise ValueError("This game has no players")

        active_player = self.get_active_player()
        active_user_index = self.players.index(active_player) if active_player else -1

        return self.players[(active_user_index + 1) % len(self.players)]

    def complete(self, state: GameState) -> None:
        self.state = state
        self.completion_time = datetime.now(UTC)

    class Settings(BaseDocument.Settings):
        name = "game"
