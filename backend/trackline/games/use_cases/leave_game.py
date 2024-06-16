from datetime import datetime

from injector import Inject
from pydantic import BaseModel

from trackline.constants import MIN_PLAYER_COUNT
from trackline.core.exceptions import UseCaseException
from trackline.core.fields import ResourceId
from trackline.games.models import GameState, Turn
from trackline.games.schemas import GameAborted, PlayerLeft, TurnOut
from trackline.games.services.notifier import Notifier
from trackline.games.services.repository import GameRepository
from trackline.games.services.track_provider import TrackProvider
from trackline.games.use_cases.base import TrackProvidingBaseHandler


class LeaveGame(BaseModel):
    game_id: ResourceId

    class Handler(TrackProvidingBaseHandler):
        def __init__(
            self,
            game_repository: Inject[GameRepository],
            track_provider: Inject[TrackProvider],
            notifier: Inject[Notifier],
        ) -> None:
            super().__init__(game_repository, track_provider)
            self._notifier = notifier

        async def execute(self, user_id: ResourceId, use_case: "LeaveGame") -> None:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)

            game_master = next((p for p in game.players if p.is_game_master), None)
            if game_master and game_master.user_id == user_id:
                raise UseCaseException(
                    code="GAME_MASTER_CANNOT_LEAVE",
                    message="The game master cannot leave the game.",
                    status_code=400,
                )

            if (
                game.state != GameState.WAITING_FOR_PLAYERS
                and len(game.players) <= MIN_PLAYER_COUNT
            ):
                await self._game_repository.update_by_id(
                    game.id,
                    {"state": GameState.ABORTED, "completion_time": datetime.utcnow()},
                )
                await self._notifier.notify(user_id, game, GameAborted())
                return

            await self._game_repository.remove_player(game.id, user_id)

            # If the user leaving is active user in an incomplete turn, it
            # will be replaced with a new one with next playing being active
            new_turn = None
            active_user_id = game.turns[-1].active_user_id if game.turns else None
            if game.state == GameState.GUESSING and active_user_id == user_id:
                track = await self._get_new_track(game)
                next_player_id = self._get_next_player_id(game)
                new_turn = Turn(
                    active_user_id=next_player_id,
                    track=track,
                )

                turn_id = len(game.turns) - 1
                await self._game_repository.replace_turn(game.id, turn_id, new_turn)

            new_turn_out = TurnOut.from_model(new_turn) if new_turn else None
            await self._notifier.notify(
                user_id,
                game,
                PlayerLeft(
                    user_id=user_id,
                    new_turn=new_turn_out,
                ),
            )
