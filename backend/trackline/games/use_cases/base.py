from typing import Collection, Sequence

from trackline.core.exceptions import UseCaseException
from trackline.games.models import Game, Track
from trackline.games.repository import GameRepository
from trackline.games.schemas import GameState
from trackline.games.track_provider import TrackProvider


class BaseHandler:
    def __init__(self, game_repository: GameRepository) -> None:
        self._game_repository = game_repository

    def _assert_is_player(self, game: Game, user_id: str) -> None:
        player_ids = [p.user_id for p in game.players]
        if not user_id or user_id not in player_ids:
            raise UseCaseException(
                code="GAME_NOT_FOUND",
                description="The game does not exist.",
                status_code=404,
            )

    def _assert_is_active_player(self, game: Game, turn_id: int, user_id: str) -> None:
        if user_id != game.turns[turn_id].active_user_id:
            raise UseCaseException(
                code="INACTIVE_PLAYER",
                description="Only the active player can perform this operation.",
                status_code=403,
            )

    def _assert_is_game_master(self, game: Game, user_id: str) -> None:
        self._assert_is_player(game, user_id)
        if not any(p.user_id == user_id and p.is_game_master for p in game.players):
            raise UseCaseException(
                code="NO_GAME_MASTER",
                description="Only the game master can perform this operation.",
                status_code=403,
            )

    def _assert_has_tokens(self, game: Game, user_id: str, tokens: int) -> None:
        player = game.get_player(user_id)
        if player and player.tokens < tokens:
            raise UseCaseException(
                code="INSUFFICIENT_TOKENS",
                description="You don't have enough tokens to perform this operation.",
                status_code=400,
            )

    def _assert_has_state(
        self,
        game: Game,
        state: GameState | Collection[GameState],
    ) -> None:
        states = [state] if isinstance(state, GameState) else state
        if all(game.state != s for s in states):
            if len(states) == 1:
                description = f"The game's state must be {list(states)[0]}"
            else:
                description = f"The game's state must be one of {','.join(states)}"

            raise UseCaseException(
                code="UNEXPECTED_STATE",
                description=description,
                status_code=400,
            )

    def _assert_has_not_state(
        self,
        game: Game,
        state: GameState | Sequence[GameState],
    ) -> None:
        forbidden_states = [state] if isinstance(state, GameState) else state
        allowed_states = set(GameState) - set(forbidden_states)
        self._assert_has_state(game, allowed_states)

    def _assert_is_active_turn(self, game: Game, turn_id: int) -> None:
        if not game.turns:
            raise UseCaseException(
                code="TURN_NOT_FOUND",
                description="The turn does not exist.",
                status_code=404,
            )

        if turn_id != len(game.turns) - 1:
            raise UseCaseException(
                code="INACTIVE_TURN",
                description="The turn is not active.",
                status_code=400,
            )

    async def _get_game(self, game_id: str) -> Game:
        game = await self._game_repository.find_by_id(game_id)
        if not game:
            raise UseCaseException(
                code="GAME_NOT_FOUND",
                description="The game does not exist.",
                status_code=404,
            )

        return game

    def _get_track_position(self, timeline: Collection[Track], track: Track) -> int:
        return next(
            (
                i
                for i, timeline_track in enumerate(timeline)
                if timeline_track.release_year > track.release_year
            ),
            len(timeline),
        )

    def _get_next_player_id(self, game: Game) -> str:
        player_ids = [p.user_id for p in game.players]
        try:
            active_user_index = player_ids.index(game.turns[-1].active_user_id)
        except (IndexError, ValueError):
            active_user_index = -1

        return player_ids[(active_user_index + 1) % len(player_ids)]


class TrackProvidingBaseHandler(BaseHandler):
    def __init__(
        self,
        game_repository: GameRepository,
        track_provider: TrackProvider,
    ) -> None:
        super().__init__(game_repository)
        self._track_provider = track_provider

    async def _get_new_track(self, game: Game):
        timeline_track_ids = {t.spotify_id for p in game.players for t in p.timeline}
        played_track_ids = {t.track.spotify_id for t in game.turns}
        exclude_track_ids = {
            *timeline_track_ids,
            *played_track_ids,
            *game.discarded_track_ids,
        }

        track = await self._track_provider.get_random_track(
            game.settings.playlist_ids,
            exclude=exclude_track_ids,
            market=game.settings.spotify_market,
        )
        if not track:
            raise UseCaseException(
                "PLAYLISTS_EXHAUSTED",
                "There are no unplayed tracks left in the selected playlists.",
            )

        return track
