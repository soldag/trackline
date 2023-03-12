from pydantic import BaseModel


from trackline.core.exceptions import UseCaseException
from trackline.games.models import Player
from trackline.games.notifier import Notifier
from trackline.games.repository import GameRepository
from trackline.games.schemas import PlayerJoined, PlayerOut
from trackline.games.use_cases.base import BaseHandler
from trackline.users.repository import UserRepository
from trackline.users.schemas import UserOut


class JoinGame(BaseModel):
    game_id: str

    class Handler(BaseHandler):
        def __init__(
            self,
            game_repository: GameRepository,
            user_repository: UserRepository,
            notifier: Notifier,
        ) -> None:
            super().__init__(game_repository)
            self._user_repository = user_repository
            self._notifier = notifier

        async def execute(self, user_id: str, use_case: "JoinGame") -> PlayerOut:
            game = await self._get_game(use_case.game_id)
            user_ids = [p.user_id for p in game.players]
            if user_id in user_ids:
                raise UseCaseException(
                    code="ALREADY_JOINED",
                    description="You have joined this game already.",
                    status_code=400,
                )

            player = Player(
                user_id=user_id,
                is_game_master=False,
                tokens=game.settings.initial_tokens,
            )
            await self._game_repository.add_player(game.id, player)

            user = await self._user_repository.find_by_id(user_id)
            user_out = UserOut.from_model(user) if user else None
            player_out = PlayerOut.from_model(player)
            await self._notifier.notify(
                user_id,
                game,
                PlayerJoined(user=user_out, player=player_out),
            )

            return player_out
