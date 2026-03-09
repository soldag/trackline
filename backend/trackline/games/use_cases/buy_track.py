import math

from injector import inject

from trackline.core.db.repository import Repository
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.constants import TOKEN_COST_BUY_TRACK
from trackline.games.models import Game
from trackline.games.schemas import (
    GameState,
    TrackBought,
    TrackOut,
    TrackPurchaseReceiptOut,
)
from trackline.games.services.game_notifier import GameNotifier
from trackline.games.services.track_provider import TrackProvider
from trackline.games.use_cases.base import TrackProvidingBaseHandler


class BuyTrack(AuthenticatedUseCase[TrackPurchaseReceiptOut]):
    game_id: ResourceId


@BuyTrack.register_handler
class Handler(TrackProvidingBaseHandler[BuyTrack, TrackPurchaseReceiptOut]):
    @inject
    def __init__(
        self,
        repository: Repository,
        track_provider: TrackProvider,
        notifier: GameNotifier,
    ) -> None:
        super().__init__(repository, track_provider)
        self._notifier = notifier

    async def execute(
        self, user_id: ResourceId, use_case: BuyTrack
    ) -> TrackPurchaseReceiptOut:
        game = await self._get_game(use_case.game_id)
        self._assert_is_player(game, user_id)
        self._assert_has_state(game, GameState.SCORING)
        self._assert_has_tokens(game, user_id, TOKEN_COST_BUY_TRACK)

        turn = game.turns[-1]
        end_condition_met_before = game.end_condition_met

        track = await self._get_new_track(game)

        current_player = game.get_player(user_id)
        current_player.add_to_timeline(track)
        current_player.tokens -= TOKEN_COST_BUY_TRACK

        if not end_condition_met_before and game.end_condition_met:
            self._handle_equalizer(game)

        track_out = TrackOut.from_model(track)
        await self._notifier.notify(
            user_id,
            game,
            TrackBought(
                user_id=user_id,
                track=track_out,
                turn_completed_by=turn.completed_by,
            ),
        )

        return TrackPurchaseReceiptOut(
            user_id=user_id,
            track=track_out,
            turn_completed_by=turn.completed_by,
        )

    def _handle_equalizer(self, game: Game) -> None:
        turn = game.turns[-1]
        max_timeline_length = max(len(p.timeline) for p in game.players)

        affected_user_ids: set[ResourceId] = set()
        for user_id in turn.completed_by:
            player = game.get_player(user_id)

            affordable_track_count = math.floor(player.tokens / TOKEN_COST_BUY_TRACK)
            if len(player.timeline) + affordable_track_count >= max_timeline_length:
                affected_user_ids.add(user_id)

        if affected_user_ids:
            turn.completed_by = list(set(turn.completed_by) - affected_user_ids)
