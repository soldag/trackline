from pydantic import BaseModel

from trackline.constants import (
    TOKEN_COST_BUY_TRACK,
)
from trackline.games.notifier import Notifier
from trackline.games.repository import GameRepository
from trackline.games.schemas import (
    GameState,
    TrackBought,
    TrackOut,
    TrackPurchaseReceiptOut,
)
from trackline.games.use_cases.base import SpotifyBaseHandler
from trackline.spotify.client import SpotifyClient


class BuyTrack(BaseModel):
    game_id: str

    class Handler(SpotifyBaseHandler):
        def __init__(
            self,
            game_repository: GameRepository,
            spotify_client: SpotifyClient,
            notifier: Notifier,
        ) -> None:
            super().__init__(game_repository, spotify_client)
            self._notifier = notifier

        async def execute(
            self, user_id: str, use_case: "BuyTrack"
        ) -> TrackPurchaseReceiptOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, GameState.SCORING)
            self._assert_has_tokens(game, user_id, TOKEN_COST_BUY_TRACK)

            current_player = game.get_player(user_id)
            assert current_player

            track = await self._get_new_track(game)
            position = self._get_track_position(current_player.timeline, track)
            await self._game_repository.insert_in_timeline(
                game.id, user_id, track, position
            )

            await self._game_repository.inc_tokens(
                game.id,
                {user_id: -TOKEN_COST_BUY_TRACK},
            )

            track_out = TrackOut.from_model(track)
            await self._notifier.notify(
                user_id,
                game,
                TrackBought(
                    user_id=user_id,
                    track=track_out,
                ),
            )

            return TrackPurchaseReceiptOut(
                user_id=user_id,
                track=track_out,
            )