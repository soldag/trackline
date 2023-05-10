from injector import Inject
from pydantic import BaseModel

from trackline.constants import MIN_PLAYER_COUNT
from trackline.core.exceptions import UseCaseException
from trackline.core.fields import ResourceId
from trackline.games.notifier import Notifier
from trackline.games.repository import GameRepository
from trackline.games.schemas import GameOut, GameStarted, GameState, TrackOut
from trackline.games.track_provider import TrackProvider
from trackline.games.use_cases.base import TrackProvidingBaseHandler


class StartGame(BaseModel):
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

        async def execute(self, user_id: ResourceId, use_case: "StartGame") -> GameOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_game_master(game, user_id)
            self._assert_has_state(game, GameState.WAITING_FOR_PLAYERS)

            if len(game.players) < MIN_PLAYER_COUNT:
                raise UseCaseException(
                    "INSUFFICIENT_PLAYER_COUNT",
                    f"At least {MIN_PLAYER_COUNT} players are needed to start the game",
                )

            await self._game_repository.update_by_id(
                game.id, {"state": GameState.STARTED}
            )

            tracks = await self._track_provider.get_random_tracks(
                game.settings.playlist_ids,
                count=len(game.players),
                market=game.settings.spotify_market,
            )
            player_tracks = {p.user_id: t for p, t in zip(game.players, tracks)}
            for player_user_id, track in player_tracks.items():
                await self._game_repository.insert_in_timeline(
                    game.id, player_user_id, track, 0
                )

            player_tracks_out = {
                user_id: TrackOut.from_model(track)
                for user_id, track in player_tracks.items()
            }
            await self._notifier.notify(
                user_id,
                game,
                GameStarted(initial_tracks=player_tracks_out),
            )

            game = game.copy(
                update={
                    "state": GameState.STARTED,
                    "players": [
                        p.copy(update={"timeline": [player_tracks[p.user_id]]})
                        for p in game.players
                    ],
                }
            )

            return GameOut.from_model(game)
