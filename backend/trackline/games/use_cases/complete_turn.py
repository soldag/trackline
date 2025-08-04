from injector import inject

from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseError
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.models import Game
from trackline.games.schemas import GameState, TurnCompleted, TurnCompletionOut
from trackline.games.services.notifier import Notifier
from trackline.games.use_cases.base import BaseHandler


class CompleteTurn(AuthenticatedUseCase[TurnCompletionOut]):
    game_id: ResourceId
    turn_id: int


@CompleteTurn.register_handler
class CompleteTurnHandler(BaseHandler[CompleteTurn, TurnCompletionOut]):
    @inject
    def __init__(self, repository: Repository, notifier: Notifier) -> None:
        super().__init__(repository)
        self._notifier = notifier

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

        user_ids = {p.user_id for p in game.players}
        completed_by = {*turn.completed_by, user_id}
        turn_completed = user_ids == completed_by

        game_completed = turn_completed and self._check_end_condition(game)
        if game_completed:
            game.complete(GameState.COMPLETED)

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

    def _check_end_condition(self, game: Game) -> bool:
        if not game.turns:
            return False

        active_user_id = game.turns[-1].active_user_id
        round_complete = game.players[-1].user_id == active_user_id

        timeline_lengths = [len(p.timeline) for p in game.players]
        has_single_winner = (
            max(timeline_lengths) >= game.settings.timeline_length
            and timeline_lengths.count(max(timeline_lengths)) == 1
        )

        return round_complete and has_single_winner
