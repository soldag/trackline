import abc
from collections.abc import Mapping
from datetime import datetime

from pydantic import BaseModel

from trackline.core.fields import ResourceId
from trackline.games.models import (
    ArtistsMatchMode,
    CreditsGuess,
    CreditsScoring,
    Game,
    GameSettings,
    GameState,
    Player,
    ReleaseYearGuess,
    ReleaseYearScoring,
    Scoring,
    TitleMatchMode,
    Track,
    Turn,
    TurnGuesses,
    TurnPass,
    TurnScoring,
)
from trackline.games.services.notifier import Notification
from trackline.users.schemas import UserOut


class TrackOut(BaseModel):
    spotify_id: str
    title: str
    artists: list[str]
    release_year: int
    image_url: str | None

    @staticmethod
    def from_model(model: Track) -> "TrackOut":
        return TrackOut(
            spotify_id=model.spotify_id,
            title=model.title,
            artists=model.artists,
            release_year=model.release_year,
            image_url=model.image_url,
        )


class PlayerOut(BaseModel):
    user_id: ResourceId
    is_game_master: bool
    tokens: int
    timeline: list[TrackOut]

    @staticmethod
    def from_model(model: Player) -> "PlayerOut":
        return PlayerOut(
            user_id=model.user_id,
            is_game_master=model.is_game_master,
            tokens=model.tokens,
            timeline=[TrackOut.from_model(t) for t in model.timeline],
        )


class GuessOut(BaseModel, abc.ABC):
    user_id: ResourceId
    creation_time: datetime
    token_cost: int


class ReleaseYearGuessOut(GuessOut):
    position: int
    year: int

    @staticmethod
    def from_model(
        model: ReleaseYearGuess, user_id: ResourceId
    ) -> "ReleaseYearGuessOut":
        return ReleaseYearGuessOut(
            user_id=user_id,
            creation_time=model.creation_time,
            token_cost=model.token_cost,
            position=model.position,
            year=model.year,
        )


class CreditsGuessOut(GuessOut):
    artists: list[str]
    title: str

    @staticmethod
    def from_model(model: CreditsGuess, user_id: ResourceId) -> "CreditsGuessOut":
        return CreditsGuessOut(
            user_id=user_id,
            creation_time=model.creation_time,
            token_cost=model.token_cost,
            artists=model.artists,
            title=model.title,
        )


class TurnGuessesOut(BaseModel):
    release_year: list[ReleaseYearGuessOut] = []
    credits: list[CreditsGuessOut] = []

    @staticmethod
    def from_model(model: TurnGuesses) -> "TurnGuessesOut":
        return TurnGuessesOut(
            release_year=[
                ReleaseYearGuessOut.from_model(guess, user_id)
                for user_id, guess in model.release_year.items()
            ],
            credits=[
                CreditsGuessOut.from_model(guess, user_id)
                for user_id, guess in model.credits.items()
            ],
        )


class TrackExchangeOut(BaseModel):
    turn_revision_id: str
    track: TrackOut
    token_delta: Mapping[ResourceId, int]


class TurnPassOut(BaseModel):
    user_id: ResourceId
    creation_time: datetime

    @staticmethod
    def from_model(user_id: ResourceId, model: TurnPass) -> "TurnPassOut":
        return TurnPassOut(user_id=user_id, creation_time=model.creation_time)


class ScoringOut(BaseModel):
    winner: ResourceId | None
    correct_guesses: list[ResourceId]
    token_gain: Mapping[ResourceId, int]

    @staticmethod
    def from_model(model: Scoring) -> "ScoringOut":
        return ScoringOut(
            winner=model.winner,
            correct_guesses=model.correct_guesses,
            token_gain=model.token_gain,
        )


class ReleaseYearScoringOut(BaseModel):
    position: ScoringOut
    year: ScoringOut

    @staticmethod
    def from_model(model: ReleaseYearScoring) -> "ReleaseYearScoringOut":
        return ReleaseYearScoringOut(
            position=ScoringOut.from_model(model.position),
            year=ScoringOut.from_model(model.year),
        )


class CreditsScoringOut(BaseModel):
    winner: ResourceId | None
    correct_guesses: list[ResourceId]
    token_gain: Mapping[ResourceId, int]
    similarity_scores: dict[ResourceId, float]

    @staticmethod
    def from_model(model: CreditsScoring) -> "CreditsScoringOut":
        return CreditsScoringOut(
            winner=model.winner,
            correct_guesses=model.correct_guesses,
            token_gain=model.token_gain,
            similarity_scores=model.similarity_scores,
        )


class TurnScoringOut(BaseModel):
    release_year: ReleaseYearScoringOut
    credits: CreditsScoringOut

    @staticmethod
    def from_model(model: TurnScoring) -> "TurnScoringOut":
        return TurnScoringOut(
            release_year=ReleaseYearScoringOut.from_model(model.release_year),
            credits=CreditsScoringOut.from_model(model.credits),
        )


class TurnOut(BaseModel):
    revision_id: str
    creation_time: datetime
    active_user_id: ResourceId
    track: TrackOut
    guesses: TurnGuessesOut
    passes: list[TurnPassOut]
    scoring: TurnScoringOut | None
    completed_by: list[ResourceId]

    @staticmethod
    def from_model(model: Turn) -> "TurnOut":
        return TurnOut(
            revision_id=model.revision_id,
            creation_time=model.creation_time,
            active_user_id=model.active_user_id,
            track=TrackOut.from_model(model.track),
            guesses=TurnGuessesOut.from_model(model.guesses),
            passes=[
                TurnPassOut.from_model(user_id, turn_pass)
                for user_id, turn_pass in model.passes.items()
            ],
            scoring=TurnScoringOut.from_model(model.scoring) if model.scoring else None,
            completed_by=model.completed_by,
        )


class GameSettingsOut(BaseModel):
    spotify_market: str
    playlist_ids: list[str]
    initial_tokens: int
    timeline_length: int
    guess_timeout: int
    artists_match_mode: ArtistsMatchMode
    title_match_mode: TitleMatchMode
    credits_similarity_threshold: float

    @staticmethod
    def from_model(model: GameSettings) -> "GameSettingsOut":
        return GameSettingsOut(
            spotify_market=model.spotify_market,
            playlist_ids=model.playlist_ids,
            initial_tokens=model.initial_tokens,
            timeline_length=model.timeline_length,
            guess_timeout=model.guess_timeout,
            artists_match_mode=model.artists_match_mode,
            title_match_mode=model.title_match_mode,
            credits_similarity_threshold=model.credits_similarity_threshold,
        )


class GameOut(BaseModel):
    id: ResourceId
    creation_time: datetime
    settings: GameSettingsOut
    state: GameState
    turns: list[TurnOut]
    players: list[PlayerOut]

    @staticmethod
    def from_model(model: Game) -> "GameOut":
        return GameOut(
            id=model.id,
            creation_time=model.creation_time,
            settings=GameSettingsOut.from_model(model.settings),
            state=model.state,
            turns=[TurnOut.from_model(t) for t in model.turns],
            players=[PlayerOut.from_model(p) for p in model.players],
        )


class TurnCompletionOut(BaseModel):
    turn_completed: bool
    game_completed: bool


class TrackPurchaseReceiptOut(BaseModel):
    user_id: ResourceId
    track: TrackOut


class PlayerJoined(Notification):
    user: UserOut
    player: PlayerOut
    position: int


class PlayerLeft(Notification):
    user_id: ResourceId
    new_turn: TurnOut | None = None


class GameStarted(Notification):
    initial_tracks: Mapping[ResourceId, TrackOut]


class GameAborted(Notification):
    pass


class NewTurn(Notification):
    turn: TurnOut


class TrackExchanged(Notification):
    turn_revision_id: str
    track: TrackOut
    token_delta: Mapping[ResourceId, int]


class ReleaseYearGuessCreated(Notification):
    guess: ReleaseYearGuessOut


class CreditsGuessCreated(Notification):
    guess: CreditsGuessOut


class TurnPassed(Notification):
    turn_pass: TurnPassOut


class TurnScored(Notification):
    scoring: TurnScoringOut


class TurnCompleted(Notification):
    user_id: ResourceId
    completion: TurnCompletionOut


class TrackBought(Notification):
    user_id: ResourceId
    track: TrackOut
