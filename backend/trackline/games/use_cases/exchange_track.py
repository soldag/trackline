from pydantic import BaseModel

from trackline.constants import TOKEN_COST_EXCHANGE_TRACK
from trackline.games.notifier import Notifier
from trackline.games.repository import GameRepository
from trackline.games.schemas import (
    GameState,
    TrackExchanged,
    TrackOut,
)
from trackline.games.use_cases.base import SpotifyBaseHandler
from trackline.spotify.client import SpotifyClient


class ExchangeTrack(BaseModel):
    game_id: str
    turn_id: int

    class Handler(SpotifyBaseHandler):
        def __init__(
            self,
            game_repository: GameRepository,
            spotify_client: SpotifyClient,
            notifier: Notifier,
        ) -> None:
            super().__init__(game_repository, spotify_client)
            self._notifier = notifier

        async def execute(self, user_id: str, use_case: "ExchangeTrack") -> TrackOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, GameState.GUESSING)
            self._assert_is_active_turn(game, use_case.turn_id)
            self._assert_is_active_player(game, use_case.turn_id, user_id)
            self._assert_has_tokens(game, user_id, TOKEN_COST_EXCHANGE_TRACK)

            old_track = game.turns[use_case.turn_id].track
            new_track = await self._get_new_track(game)
            await self._game_repository.exchange_track(
                game.id, use_case.turn_id, old_track.spotify_id, new_track
            )
            await self._game_repository.inc_tokens(
                game.id,
                {user_id: -TOKEN_COST_EXCHANGE_TRACK},
            )

            new_track_out = TrackOut.from_model(new_track)
            await self._notifier.notify(
                user_id, game, TrackExchanged(track=new_track_out)
            )

            return new_track_out
