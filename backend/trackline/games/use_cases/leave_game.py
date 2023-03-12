from pydantic import BaseModel


from trackline.core.exceptions import UseCaseException
from trackline.games.notifier import Notifier
from trackline.games.repository import GameRepository
from trackline.games.schemas import PlayerLeft
from trackline.games.use_cases.base import BaseHandler


class LeaveGame(BaseModel):
    game_id: str

    class Handler(BaseHandler):
        def __init__(self, game_repository: GameRepository, notifier: Notifier) -> None:
            super().__init__(game_repository)
            self._notifier = notifier

        async def execute(self, user_id: str, use_case: "LeaveGame") -> None:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)

            game_master = next((p for p in game.players if p.is_game_master), None)
            if game_master and game_master.user_id == user_id:
                raise UseCaseException(
                    code="GAME_MASTER_CANNOT_LEAVE",
                    description="The game master cannot leave the game",
                    status_code=400,
                )

            await self._game_repository.remove_player(game.id, user_id)

            await self._notifier.notify(
                user_id,
                game,
                PlayerLeft(user_id=user_id),
            )
