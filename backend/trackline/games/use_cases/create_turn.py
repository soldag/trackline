from pydantic import BaseModel

from trackline.games.models import Turn
from trackline.games.notifier import Notifier
from trackline.games.repository import GameRepository
from trackline.games.schemas import GameState, NewTurn, TurnOut
from trackline.games.use_cases.base import SpotifyBaseHandler
from trackline.spotify.client import SpotifyClient


class CreateTurn(BaseModel):
    game_id: str

    class Handler(SpotifyBaseHandler):
        def __init__(
            self,
            game_repository: GameRepository,
            spotify_client: SpotifyClient,
            notifier: Notifier,
        ) -> None:
            super().__init__(game_repository, spotify_client)
            self._notifier = notifier

        async def execute(self, user_id: str, use_case: "CreateTurn") -> TurnOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, (GameState.STARTED, GameState.SCORING))

            player_ids = [p.user_id for p in game.players]
            try:
                active_user_index = player_ids.index(game.turns[-1].active_user_id)
            except (IndexError, ValueError):
                active_user_index = -1
            next_player_id = player_ids[(active_user_index + 1) % len(player_ids)]

            track = await self._get_new_track(game)
            turn = Turn(
                active_user_id=next_player_id,
                track=track,
            )
            await self._game_repository.add_turn(game.id, turn)
            await self._game_repository.update_by_id(
                game.id, {"state": GameState.GUESSING}
            )

            turn_out = TurnOut.from_model(turn)
            await self._notifier.notify(user_id, game, NewTurn(turn=turn_out))

            return turn_out
