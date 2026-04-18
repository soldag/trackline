import random
from typing import Annotated

from injector import inject
from pydantic import StringConstraints

from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseError
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.constants import JOIN_CODE_LENGTH
from trackline.games.models import Game, GameState, Player
from trackline.games.schemas import GameOut, PlayerJoined, PlayerOut
from trackline.games.services.game_notifier import GameNotifier
from trackline.games.use_cases.base import BaseHandler
from trackline.users.models import User
from trackline.users.schemas import UserOut


class JoinGame(AuthenticatedUseCase[GameOut]):
    join_code: Annotated[
        str,
        StringConstraints(
            min_length=JOIN_CODE_LENGTH,
            max_length=JOIN_CODE_LENGTH,
            strip_whitespace=True,
            to_upper=True,
        ),
    ]


@JoinGame.register_handler
class Handler(BaseHandler[JoinGame, GameOut]):
    @inject
    def __init__(
        self,
        repository: Repository,
        notifier: GameNotifier,
    ) -> None:
        super().__init__(repository)
        self._notifier = notifier

    async def execute(self, user_id: ResourceId, use_case: JoinGame) -> GameOut:
        game = await self._repository.get_one(
            Game,
            {
                "join_code": use_case.join_code,
                "state": GameState.WAITING_FOR_PLAYERS,
            },
        )
        if not game:
            raise UseCaseError(
                code="INVALID_JOIN_CODE",
                message="This join code is invalid.",
                status_code=400,
            )

        # Just return the game if user has already joined the game
        user_ids = {p.user_id for p in game.players}
        if user_id in user_ids:
            return GameOut.from_model(game)

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

        return GameOut.from_model(game)
