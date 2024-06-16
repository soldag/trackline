import random

from injector import Inject
from pydantic import BaseModel

from trackline.core.exceptions import UseCaseException
from trackline.core.fields import ResourceId
from trackline.games.models import GameState, Player
from trackline.games.schemas import PlayerJoined, PlayerOut
from trackline.games.services.notifier import Notifier
from trackline.games.services.repository import GameRepository
from trackline.games.use_cases.base import BaseHandler
from trackline.users.schemas import UserOut
from trackline.users.services.repository import UserRepository


class JoinGame(BaseModel):
    game_id: ResourceId

    class Handler(BaseHandler):
        def __init__(
            self,
            game_repository: Inject[GameRepository],
            user_repository: Inject[UserRepository],
            notifier: Inject[Notifier],
        ) -> None:
            super().__init__(game_repository)
            self._user_repository = user_repository
            self._notifier = notifier

        async def execute(self, user_id: ResourceId, use_case: "JoinGame") -> PlayerOut:
            game = await self._get_game(use_case.game_id)
            if game.state != GameState.WAITING_FOR_PLAYERS:
                raise UseCaseException(
                    code="GAME_NOT_FOUND",
                    message="The game does not exist.",
                    status_code=404,
                )

            user_ids = [p.user_id for p in game.players]
            if user_id in user_ids:
                raise UseCaseException(
                    code="ALREADY_JOINED",
                    message="You have joined this game already.",
                    status_code=400,
                )

            player = Player(
                user_id=user_id,
                is_game_master=False,
                tokens=game.settings.initial_tokens,
            )

            # The player is inserted at a random position to prevent the
            # game master from always being the start player
            position = random.randint(0, len(game.players))
            await self._game_repository.add_player(game.id, player, position)

            user = await self._user_repository.find_by_id(user_id)
            assert user

            user_out = UserOut.from_model(user)
            player_out = PlayerOut.from_model(player)
            await self._notifier.notify(
                user_id,
                game,
                PlayerJoined(user=user_out, player=player_out, position=position),
            )

            return player_out
