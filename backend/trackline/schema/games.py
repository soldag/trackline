from datetime import datetime
from typing import List, Mapping

from pydantic import BaseModel

from trackline.models.games import (
    Game,
    GameSettings,
    GameState,
    Guess,
    Player,
    Track,
    Turn,
)
from trackline.schema.base import Notification
from trackline.schema.users import UserOut


class TrackOut(BaseModel):
    spotify_id: str
    title: str
    artists: str
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
    timestamp: datetime
    position: int | None
    release_year: int | None

    @staticmethod
    def from_model(model: Guess, user_id: str) -> "GuessOut":
        return GuessOut(
            user_id=user_id,
            timestamp=model.timestamp,
            position=model.position,
            release_year=model.release_year,
        )


class TurnOut(BaseModel):
    active_user_id: str
    track: TrackOut
    guesses: List[GuessOut]

    @staticmethod
    def from_model(model: Turn) -> "TurnOut":
        return TurnOut(
            active_user_id=model.active_user_id,
            track=TrackOut.from_model(model.track),
            guesses=[
                GuessOut.from_model(guess, user_id)
                for user_id, guess in model.guesses.items()
            ],
        )


class GameSettingsOut(BaseModel):
    spotify_market: str
    playlist_ids: List[str]

    @staticmethod
    def from_model(model: GameSettings) -> "GameSettingsOut":
        return GameSettingsOut(
            spotify_market=model.spotify_market,
            playlist_ids=model.playlist_ids,
        )


class GameOut(BaseModel):
    id: str
    settings: GameSettingsOut
    state: GameState
    turns: List[TurnOut]
    players: List[PlayerOut]

    @staticmethod
    def from_model(model: Game) -> "GameOut":
        return GameOut(
            id=model.id,
            settings=GameSettingsOut.from_model(model.settings),
            state=model.state,
            turns=[TurnOut.from_model(t) for t in model.turns],
            players=[PlayerOut.from_model(p) for p in model.players],
        )


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
