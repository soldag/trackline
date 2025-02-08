from injector import Inject
from pydantic import BaseModel

from trackline.core.db.client import DatabaseClient
from trackline.core.fields import ResourceId
from trackline.games.models import Turn
from trackline.games.schemas import GameState, NewTurn, TurnOut
from trackline.games.services.notifier import Notifier
from trackline.games.services.track_provider import TrackProvider
from trackline.games.use_cases.base import TrackProvidingBaseHandler


class CreateTurn(BaseModel):
    game_id: ResourceId

    class Handler(TrackProvidingBaseHandler):
        def __init__(
            self,
            db: Inject[DatabaseClient],
            track_provider: Inject[TrackProvider],
            notifier: Inject[Notifier],
        ) -> None:
            super().__init__(db, track_provider)
            self._notifier = notifier

        async def execute(self, user_id: ResourceId, use_case: "CreateTurn") -> TurnOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, (GameState.STARTED, GameState.SCORING))

            track = await self._get_new_track(game)
            next_player = game.get_next_player()
            turn = Turn(
                active_user_id=next_player.user_id,
                track=track,
            )

            game.state = GameState.GUESSING
            game.turns.append(turn)
            await game.save_changes(session=self._db.session)

            turn_out = TurnOut.from_model(turn)
            await self._notifier.notify(user_id, game, NewTurn(turn=turn_out))

            return turn_out
