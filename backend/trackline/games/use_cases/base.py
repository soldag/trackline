import abc
from collections.abc import Collection, Mapping, Sequence

from injector import Inject

from trackline.core.exceptions import UseCaseException
from trackline.core.fields import ResourceId
from trackline.games.models import Game, Guess, Track, Turn
from trackline.games.notifier import Notifier
from trackline.games.repository import GameRepository
from trackline.games.schemas import GameState
from trackline.games.track_provider import TrackProvider


class BaseHandler:
    def __init__(self, game_repository: Inject[GameRepository]) -> None:
        self._game_repository = game_repository

    def _assert_is_player(self, game: Game, user_id: ResourceId) -> None:
        player_ids = [p.user_id for p in game.players]
        if not user_id or user_id not in player_ids:
            raise UseCaseException(
                code="GAME_NOT_FOUND",
                message="The game does not exist.",
                status_code=404,
            )

    def _assert_is_active_player(
        self, game: Game, turn_id: int, user_id: ResourceId
    ) -> None:
        if user_id != game.turns[turn_id].active_user_id:
            raise UseCaseException(
                code="INACTIVE_PLAYER",
                message="Only the active player can perform this operation.",
                status_code=403,
            )

    def _assert_is_game_master(self, game: Game, user_id: ResourceId) -> None:
        self._assert_is_player(game, user_id)
        if not any(p.user_id == user_id and p.is_game_master for p in game.players):
            raise UseCaseException(
                code="NO_GAME_MASTER",
                message="Only the game master can perform this operation.",
                status_code=403,
            )

    def _assert_has_not_passed(
        self, game: Game, turn_id: int, user_id: ResourceId
    ) -> None:
        if user_id in game.turns[turn_id].passes:
            raise UseCaseException(
                code="TURN_PASSED",
                message="You have passed already this turn.",
                status_code=400,
            )

    def _assert_has_tokens(self, game: Game, user_id: ResourceId, tokens: int) -> None:
        player = game.get_player(user_id)
        if player and player.tokens < tokens:
            raise UseCaseException(
                code="INSUFFICIENT_TOKENS",
                message="You don't have enough tokens to perform this operation.",
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
                message=description,
                status_code=400,
            )

    def _assert_has_not_state(
        self,
        game: Game,
        state: GameState | Collection[GameState],
    ) -> None:
        forbidden_states = [state] if isinstance(state, GameState) else state
        allowed_states = set(GameState) - set(forbidden_states)
        self._assert_has_state(game, allowed_states)

    def _assert_is_active_turn(self, game: Game, turn_id: int) -> None:
        if not game.turns:
            raise UseCaseException(
                code="TURN_NOT_FOUND",
                message="The turn does not exist.",
                status_code=404,
            )

        if turn_id != len(game.turns) - 1:
            raise UseCaseException(
                code="INACTIVE_TURN",
                message="The turn is not active.",
                status_code=400,
            )

    async def _get_game(self, game_id: ResourceId) -> Game:
        game = await self._game_repository.find_by_id(game_id)
        if not game:
            raise UseCaseException(
                code="GAME_NOT_FOUND",
                message="The game does not exist.",
                status_code=404,
            )

        return game

    def _get_track_position(self, timeline: Sequence[Track], track: Track) -> int:
        return next(
            (
                i
                for i, timeline_track in enumerate(timeline)
                if timeline_track.release_year > track.release_year
            ),
            len(timeline),
        )

    def _get_next_player_id(self, game: Game) -> ResourceId:
        player_ids = [p.user_id for p in game.players]
        try:
            active_user_index = player_ids.index(game.turns[-1].active_user_id)
        except (IndexError, ValueError):
            active_user_index = -1

        return player_ids[(active_user_index + 1) % len(player_ids)]


class TrackProvidingBaseHandler(BaseHandler):
    def __init__(
        self,
        game_repository: Inject[GameRepository],
        track_provider: Inject[TrackProvider],
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


class CreateGuessBaseHandler(BaseHandler, abc.ABC):
    def __init__(
        self,
        game_repository: Inject[GameRepository],
        notifier: Inject[Notifier],
    ) -> None:
        super().__init__(game_repository)
        self._notifier = notifier

    @abc.abstractmethod
    def _get_guesses(self, turn: Turn) -> Mapping[ResourceId, Guess]:
        pass

    def _get_token_cost(self, user_id: ResourceId, game: Game, base_cost: int) -> int:
        active_player = game.get_active_player()
        if active_player and active_player.user_id == user_id:
            return 0

        return base_cost

    def _assert_can_guess(
        self, user_id: ResourceId, game: Game, turn_id: int, token_cost: int
    ) -> None:
        self._assert_is_player(game, user_id)
        self._assert_has_state(game, GameState.GUESSING)
        self._assert_is_active_turn(game, turn_id)

        turn = game.turns[turn_id]
        if user_id in self._get_guesses(turn):
            raise UseCaseException(
                code="TURN_GUESSED",
                message="You have already guessed this item for this turn.",
                status_code=400,
            )
        if user_id in turn.passes:
            raise UseCaseException(
                code="TURN_PASSED",
                message="You have already passed for this turn.",
                status_code=400,
            )

        if token_cost > 0:
            self._assert_has_tokens(game, user_id, token_cost)
