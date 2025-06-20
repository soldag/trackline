from injector import Inject
from pydantic import BaseModel

from trackline.core.db.repository import Repository
from trackline.core.fields import ResourceId
from trackline.games.schemas import GameState, TurnScored, TurnScoringOut
from trackline.games.services.notifier import Notifier
from trackline.games.services.scoring_service import ScoringService
from trackline.games.use_cases.base import BaseHandler


class ScoreTurn(BaseModel):
    game_id: ResourceId
    turn_id: int

    class Handler(BaseHandler):
        def __init__(
            self,
            repository: Inject[Repository],
            scoring_service: Inject[ScoringService],
            notifier: Inject[Notifier],
        ) -> None:
            super().__init__(repository)
            self._scoring_service = scoring_service
            self._notifier = notifier

        async def execute(
            self,
            user_id: ResourceId,
            use_case: "ScoreTurn",
        ) -> TurnScoringOut:
            game_id = use_case.game_id
            turn_id = use_case.turn_id

            game = await self._get_game(game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, GameState.GUESSING)
            self._assert_is_active_turn(game, turn_id)
            self._assert_is_active_player(game, turn_id, user_id)

            scoring = await self._scoring_service.score_turn(game, turn_id)

            scoring_out = TurnScoringOut.from_model(scoring)
            await self._notifier.notify(
                user_id,
                game,
                TurnScored(scoring=scoring_out),
            )

            return scoring_out
