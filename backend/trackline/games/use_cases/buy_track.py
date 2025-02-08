from injector import Inject
from pydantic import BaseModel

from trackline.constants import (
    TOKEN_COST_BUY_TRACK,
)
from trackline.core.db.client import DatabaseClient
from trackline.core.fields import ResourceId
from trackline.games.schemas import (
    GameState,
    TrackBought,
    TrackOut,
    TrackPurchaseReceiptOut,
)
from trackline.games.services.notifier import Notifier
from trackline.games.services.track_provider import TrackProvider
from trackline.games.use_cases.base import TrackProvidingBaseHandler


class BuyTrack(BaseModel):
    game_id: ResourceId

    class Handler(TrackProvidingBaseHandler):
        def __init__(
            self,
            db: Inject[DatabaseClient],
            track_provider: Inject[TrackProvider],
            notifier: Inject[Notifier],
        ) -> None:
            super().__init__(db, track_provider)
            self._notifier = notifier

        async def execute(
            self, user_id: ResourceId, use_case: "BuyTrack"
        ) -> TrackPurchaseReceiptOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, GameState.SCORING)
            self._assert_has_tokens(game, user_id, TOKEN_COST_BUY_TRACK)

            current_player = game.get_player(user_id)
            assert current_player

            track = await self._get_new_track(game)

            current_player.add_to_timeline(track)
            current_player.tokens -= TOKEN_COST_BUY_TRACK
            await game.save_changes(session=self._db.session)

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
