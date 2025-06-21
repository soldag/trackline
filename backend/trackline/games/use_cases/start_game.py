from injector import inject
from pydantic import BaseModel

from trackline.constants import MIN_PLAYER_COUNT
from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseError
from trackline.core.fields import ResourceId
from trackline.games.schemas import GameOut, GameStarted, GameState, TrackOut
from trackline.games.services.notifier import Notifier
from trackline.games.services.track_provider import TrackProvider
from trackline.games.use_cases.base import TrackProvidingBaseHandler


class StartGame(BaseModel):
    game_id: ResourceId

    class Handler(TrackProvidingBaseHandler):
        @inject
        def __init__(
            self,
            repository: Repository,
            track_provider: TrackProvider,
            notifier: Notifier,
        ) -> None:
            super().__init__(repository, track_provider)
            self._notifier = notifier

        async def execute(self, user_id: ResourceId, use_case: "StartGame") -> GameOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_game_master(game, user_id)
            self._assert_has_state(game, GameState.WAITING_FOR_PLAYERS)

            if len(game.players) < MIN_PLAYER_COUNT:
                raise UseCaseError(
                    "INSUFFICIENT_PLAYER_COUNT",
                    f"At least {MIN_PLAYER_COUNT} players are needed to start the game",
                )

            tracks = await self._track_provider.get_random_tracks(
                game.settings.playlists,
                count=len(game.players),
                market=game.settings.spotify_market,
            )
            for player, track in zip(game.players, tracks, strict=False):
                player.timeline = [track]

            game.state = GameState.STARTED

            player_tracks_out = {
                player.user_id: TrackOut.from_model(player.timeline[0])
                for player in game.players
            }
            await self._notifier.notify(
                user_id,
                game,
                GameStarted(initial_tracks=player_tracks_out),
            )

            return GameOut.from_model(game)
