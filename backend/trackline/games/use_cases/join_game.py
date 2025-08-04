import random

from injector import inject

from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseError
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.models import GameState, Player
from trackline.games.schemas import PlayerJoined, PlayerOut
from trackline.games.services.notifier import Notifier
from trackline.games.use_cases.base import BaseHandler
from trackline.users.models import User
from trackline.users.schemas import UserOut


class JoinGame(AuthenticatedUseCase[PlayerOut]):
    game_id: ResourceId


@JoinGame.register_handler
class Handler(BaseHandler[JoinGame, PlayerOut]):
    @inject
    def __init__(
        self,
        repository: Repository,
        notifier: Notifier,
    ) -> None:
        super().__init__(repository)
        self._notifier = notifier

    async def execute(self, user_id: ResourceId, use_case: JoinGame) -> PlayerOut:
        game = await self._get_game(use_case.game_id)
        if game.state != GameState.WAITING_FOR_PLAYERS:
            raise UseCaseError(
                code="GAME_NOT_FOUND",
                message="The game does not exist.",
                status_code=404,
            )

        user_ids = [p.user_id for p in game.players]
        if user_id in user_ids:
            raise UseCaseError(
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
        position = random.randint(0, len(game.players))  # noqa: S311
        game.players.insert(position, player)

        user = await User.get(user_id)
        if not user:
            raise UseCaseError(
                code="USER_NOT_FOUND",
                message="The session user does not exist.",
                status_code=400,
            )

        user_out = UserOut.from_model(user)
        player_out = PlayerOut.from_model(player)
        await self._notifier.notify(
            user_id,
            game,
            PlayerJoined(user=user_out, player=player_out, position=position),
        )

        return player_out
