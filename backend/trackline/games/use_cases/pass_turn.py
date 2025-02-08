from injector import Inject
from pydantic import BaseModel

from trackline.core.db.client import DatabaseClient
from trackline.core.exceptions import UseCaseException
from trackline.core.fields import ResourceId
from trackline.games.models import GameState, TurnPass
from trackline.games.schemas import TurnPassed, TurnPassOut
from trackline.games.services.notifier import Notifier
from trackline.games.use_cases.base import BaseHandler


class PassTurn(BaseModel):
    game_id: ResourceId
    turn_id: int

    class Handler(BaseHandler):
        def __init__(
            self,
            db: Inject[DatabaseClient],
            notifier: Inject[Notifier],
        ) -> None:
            super().__init__(db)
            self._notifier = notifier

        async def execute(
            self, user_id: ResourceId, use_case: "PassTurn"
        ) -> TurnPassOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, GameState.GUESSING)
            self._assert_is_active_turn(game, use_case.turn_id)

            turn = game.turns[use_case.turn_id]
            if user_id in turn.passes:
                raise UseCaseException(
                    code="TURN_PASSED",
                    message="You have already passed for this turn.",
                    status_code=400,
                )

            turn_pass = TurnPass()
            turn.passes[user_id] = turn_pass
            await game.save_changes(session=self._db.session)

            turn_pass_out = TurnPassOut.from_model(user_id, turn_pass)
            await self._notifier.notify(
                user_id, game, TurnPassed(turn_pass=turn_pass_out)
            )

            return turn_pass_out
