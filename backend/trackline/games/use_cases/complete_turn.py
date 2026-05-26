from injector import inject

from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseError
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.schemas import GameState, TurnCompleted, TurnCompletionOut
from trackline.games.services.game_notifier import GameNotifier
from trackline.games.services.track_cache import TrackCache
from trackline.games.use_cases.base import BaseHandler


class CompleteTurn(AuthenticatedUseCase[TurnCompletionOut]):
    game_id: ResourceId
    turn_id: int


@CompleteTurn.register_handler
class CompleteTurnHandler(BaseHandler[CompleteTurn, TurnCompletionOut]):
    @inject
    def __init__(
        self,
        repository: Repository,
        notifier: GameNotifier,
        track_cache: TrackCache,
    ) -> None:
        super().__init__(repository)
        self._notifier = notifier
        self._track_cache = track_cache

    async def execute(
        self,
        user_id: ResourceId,
        use_case: CompleteTurn,
    ) -> TurnCompletionOut:
        game = await self._get_game(use_case.game_id)
        self._assert_is_player(game, user_id)
        self._assert_has_state(game, GameState.SCORING)
        self._assert_is_active_turn(game, use_case.turn_id)

        turn = game.turns[use_case.turn_id]
        if user_id not in turn.completed_by:
            turn.completed_by.append(user_id)
        else:
            raise UseCaseError(
                code="TURN_COMPLETED",
                message="You have already completed this turn.",
                status_code=400,
            )

        user_ids = {p.user_id for p in game.current_players}
        completed_by = {*turn.completed_by, user_id}
        turn_completed = user_ids == completed_by

        game_completed = turn_completed and game.end_condition_met
        if game_completed:
            game.complete(GameState.COMPLETED)
            self._track_cache.clear(use_case.game_id)

        completion_out = TurnCompletionOut(
            turn_completed=turn_completed,
            game_completed=game_completed,
        )
        await self._notifier.notify(
            user_id,
            game,
            TurnCompleted(user_id=user_id, completion=completion_out),
        )

        return completion_out
