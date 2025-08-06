from injector import inject

from trackline.core.db.repository import Repository
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.schemas import (
    GameState,
    TrackBought,
    TrackOut,
    TrackPurchaseReceiptOut,
)
from trackline.games.services.notifications import Notifier
from trackline.games.services.track_provider import TrackProvider
from trackline.games.use_cases.base import TrackProvidingBaseHandler

TOKEN_COST = 3


class BuyTrack(AuthenticatedUseCase[TrackPurchaseReceiptOut]):
    game_id: ResourceId


@BuyTrack.register_handler
class Handler(TrackProvidingBaseHandler[BuyTrack, TrackPurchaseReceiptOut]):
    @inject
    def __init__(
        self,
        repository: Repository,
        track_provider: TrackProvider,
        notifier: Notifier,
    ) -> None:
        super().__init__(repository, track_provider)
        self._notifier = notifier

    async def execute(
        self, user_id: ResourceId, use_case: BuyTrack
    ) -> TrackPurchaseReceiptOut:
        game = await self._get_game(use_case.game_id)
        self._assert_is_player(game, user_id)
        self._assert_has_state(game, GameState.SCORING)
        self._assert_has_tokens(game, user_id, TOKEN_COST)

        track = await self._get_new_track(game)

        current_player = game.get_player(user_id)
        current_player.add_to_timeline(track)
        current_player.tokens -= TOKEN_COST

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
