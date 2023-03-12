from datetime import datetime
from typing import List, Mapping

from pydantic import BaseModel

from trackline.games.models import (
    CategoryScoring,
    Game,
    GameSettings,
    GameState,
    Guess,
    Player,
    Turn,
    TurnScoring,
)
from trackline.games.notifier import Notification
from trackline.spotify.schemas import TrackOut
from trackline.users.schemas import UserOut


class PlayerOut(BaseModel):
    user_id: str
    is_game_master: bool
    tokens: int
    timeline: List[TrackOut]

    @staticmethod
    def from_model(model: Player) -> "PlayerOut":
        return PlayerOut(
            user_id=model.user_id,
            is_game_master=model.is_game_master,
            tokens=model.tokens,
            timeline=model.timeline,
        )


class GuessOut(BaseModel):
    user_id: str
    creation_time: datetime
    position: int | None
    release_year: int | None

    @staticmethod
    def from_model(model: Guess, user_id: str) -> "GuessOut":
        return GuessOut(
            user_id=user_id,
            creation_time=model.creation_time,
            position=model.position,
            release_year=model.release_year,
        )


class CategoryScoringOut(BaseModel):
    winner: str | None
    tokens_delta: Mapping[str, int]

    @staticmethod
    def from_model(model: CategoryScoring) -> "CategoryScoringOut":
        return CategoryScoringOut(
            winner=model.winner,
            tokens_delta=model.tokens_delta,
        )


class TurnScoringOut(BaseModel):
    position: CategoryScoringOut
    release_year: CategoryScoringOut

    @staticmethod
    def from_model(model: TurnScoring) -> "TurnScoringOut":
        return TurnScoringOut(
            position=CategoryScoringOut.from_model(model.position),
            release_year=CategoryScoringOut.from_model(model.release_year),
        )


class TurnOut(BaseModel):
    creation_time: datetime
    active_user_id: str
    track: TrackOut
    guesses: List[GuessOut]
    scoring: TurnScoringOut | None
    completed_by: List[str]

    @staticmethod
    def from_model(model: Turn) -> "TurnOut":
        return TurnOut(
            creation_time=model.creation_time,
            active_user_id=model.active_user_id,
            track=TrackOut.from_model(model.track),
            guesses=[
                GuessOut.from_model(guess, user_id)
                for user_id, guess in model.guesses.items()
            ],
            scoring=TurnScoringOut.from_model(model.scoring) if model.scoring else None,
            completed_by=model.completed_by,
        )


class GameSettingsOut(BaseModel):
    spotify_market: str
    playlist_ids: List[str]
    initial_tokens: int
    timeline_length: int
    guess_timeout: int

    @staticmethod
    def from_model(model: GameSettings) -> "GameSettingsOut":
        return GameSettingsOut(
            spotify_market=model.spotify_market,
            playlist_ids=model.playlist_ids,
            initial_tokens=model.initial_tokens,
            timeline_length=model.timeline_length,
            guess_timeout=model.guess_timeout,
        )


class GameOut(BaseModel):
    id: str
    creation_time: datetime
    settings: GameSettingsOut
    state: GameState
    turns: List[TurnOut]
    players: List[PlayerOut]

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
    user_id: str
    track: TrackOut


class PlayerJoined(Notification):
    user: UserOut
    player: PlayerOut


class PlayerLeft(Notification):
    user_id: str
    new_turn: TurnOut | None


class GameStarted(Notification):
    initial_tracks: Mapping[str, TrackOut]


class GameAborted(Notification):
    pass


class NewTurn(Notification):
    turn: TurnOut


class TrackExchanged(Notification):
    track: TrackOut


class NewGuess(Notification):
    guess: GuessOut


class TurnScored(Notification):
    scoring: TurnScoringOut


class TurnCompleted(Notification):
    user_id: str
    completion: TurnCompletionOut


class TrackBought(Notification):
    user_id: str
    track: TrackOut