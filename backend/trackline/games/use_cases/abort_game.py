from datetime import datetime

from injector import Inject
from pydantic import BaseModel

from trackline.core.fields import ResourceId
from trackline.games.schemas import GameAborted, GameState
from trackline.games.services.notifier import Notifier
from trackline.games.services.repository import GameRepository
from trackline.games.use_cases.base import BaseHandler


class AbortGame(BaseModel):
    game_id: ResourceId

    class Handler(BaseHandler):
        def __init__(
            self,
            game_repository: Inject[GameRepository],
            notifier: Inject[Notifier],
        ) -> None:
            super().__init__(game_repository)
            self._notifier = notifier

        async def execute(self, user_id: ResourceId, use_case: "AbortGame") -> None:
            game = await self._get_game(use_case.game_id)
            self._assert_is_game_master(game, user_id)
            self._assert_has_not_state(game, (GameState.ABORTED, GameState.COMPLETED))

            await self._game_repository.update_by_id(
                game.id,
                {"state": GameState.ABORTED, "completion_time": datetime.utcnow()},
            )

            await self._notifier.notify(user_id, game, GameAborted())
