from injector import Inject
from pydantic import BaseModel

from trackline.core.exceptions import UseCaseException
from trackline.core.fields import ResourceId
from trackline.games.models import (
    Game,
)
from trackline.games.notifier import Notifier
from trackline.games.repository import GameRepository
from trackline.games.schemas import (
    GameState,
    TurnCompleted,
    TurnCompletionOut,
)
from trackline.games.use_cases.base import BaseHandler


class CompleteTurn(BaseModel):
    game_id: ResourceId
    turn_id: int

    class Handler(BaseHandler):
        def __init__(
            self, game_repository: Inject[GameRepository], notifier: Inject[Notifier]
        ) -> None:
            super().__init__(game_repository)
            self._notifier = notifier

        async def execute(
            self, user_id: ResourceId, use_case: "CompleteTurn"
        ) -> TurnCompletionOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, GameState.SCORING)
            self._assert_is_active_turn(game, use_case.turn_id)

            turn = game.turns[use_case.turn_id]
            if user_id in turn.completed_by:
                raise UseCaseException(
                    code="COMPLETED_ALREADY",
                    description="You have already completed this turn.",
                    status_code=400,
                )

            await self._game_repository.add_turn_completed_by(
                use_case.game_id, use_case.turn_id, user_id
            )

            user_ids = {p.user_id for p in game.players}
            completed_by = {*turn.completed_by, user_id}
            turn_completed = user_ids == completed_by

            game_completed = turn_completed and self._check_end_condition(game)
            if game_completed:
                await self._game_repository.update_by_id(
                    game.id, {"state": GameState.COMPLETED}
                )

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
