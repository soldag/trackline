from injector import inject

from trackline.core.db.repository import Repository
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.schemas import GameAborted, GameState
from trackline.games.services.notifier import Notifier
from trackline.games.use_cases.base import BaseHandler


class AbortGame(AuthenticatedUseCase):
    game_id: ResourceId


@AbortGame.register_handler
class Handler(BaseHandler[AbortGame]):
    @inject
    def __init__(
        self,
        repository: Repository,
        notifier: Notifier,
    ) -> None:
        super().__init__(repository)
        self._notifier = notifier

    async def execute(self, user_id: ResourceId, use_case: AbortGame) -> None:
        game = await self._get_game(use_case.game_id)
        self._assert_is_game_master(game, user_id)
        self._assert_has_not_state(game, (GameState.ABORTED, GameState.COMPLETED))

        game.complete(GameState.ABORTED)

        await self._notifier.notify(user_id, game, GameAborted())
