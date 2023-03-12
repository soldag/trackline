from pydantic import BaseModel


from trackline.games.notifier import Notifier
from trackline.games.repository import GameRepository
from trackline.games.schemas import GameOut, GameStarted, GameState
from trackline.games.use_cases.base import BaseHandler
from trackline.spotify.client import SpotifyClient


class StartGame(BaseModel):
    game_id: str

    class Handler(BaseHandler):
        def __init__(
            self,
            game_repository: GameRepository,
            spotify_client: SpotifyClient,
            notifier: Notifier,
        ) -> None:
            super().__init__(game_repository)
            self._spotify_client = spotify_client
            self._notifier = notifier

        async def execute(self, user_id: str, use_case: "StartGame") -> GameOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_game_master(game, user_id)
            self._assert_has_state(game, GameState.WAITING_FOR_PLAYERS)

            await self._game_repository.update_by_id(
                game.id, {"state": GameState.STARTED}
            )

            tracks = await self._spotify_client.get_random_tracks(
                game.settings.playlist_ids,
                count=len(game.players),
                market=game.settings.spotify_market,
            )
            player_tracks = {p.user_id: t for p, t in zip(game.players, tracks)}
            for player_user_id, track in player_tracks.items():
                await self._game_repository.insert_in_timeline(
                    game.id, player_user_id, track, 0
                )

            await self._notifier.notify(
                user_id,
                game,
                GameStarted(initial_tracks=player_tracks),
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
