import abc
from collections.abc import Collection, Mapping
from typing import Any, TypeVar

from injector import inject

from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseError
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase, AuthenticatedUseCaseHandler
from trackline.games.models import Game, Guess, Track, Turn
from trackline.games.schemas import GameState
from trackline.games.services.notifications import Notifier
from trackline.games.services.track_provider import TrackProvider

TResult = TypeVar("TResult", default=None)
TUseCase = TypeVar("TUseCase", bound=AuthenticatedUseCase[Any])


class BaseHandler(AuthenticatedUseCaseHandler[TUseCase, TResult]):
    @inject
    def __init__(self, repository: Repository) -> None:
        self._repository = repository

    def _assert_is_player(self, game: Game, user_id: ResourceId) -> None:
        player_ids = [p.user_id for p in game.players]
        if not user_id or user_id not in player_ids:
            raise UseCaseError(
                code="GAME_NOT_FOUND",
                message="The game does not exist.",
                status_code=404,
            )

    def _assert_is_active_player(
        self,
        game: Game,
        turn_id: int,
        user_id: ResourceId,
    ) -> None:
        if user_id != game.turns[turn_id].active_user_id:
            raise UseCaseError(
                code="INACTIVE_PLAYER",
                message="Only the active player can perform this operation.",
                status_code=403,
            )

    def _assert_is_game_master(self, game: Game, user_id: ResourceId) -> None:
        self._assert_is_player(game, user_id)
        if not any(p.user_id == user_id and p.is_game_master for p in game.players):
            raise UseCaseError(
                code="NO_GAME_MASTER",
                message="Only the game master can perform this operation.",
                status_code=403,
            )

    def _assert_has_not_passed(
        self,
        game: Game,
        turn_id: int,
        user_id: ResourceId,
    ) -> None:
        if user_id in game.turns[turn_id].passes:
            raise UseCaseError(
                code="TURN_PASSED",
                message="You have passed already this turn.",
                status_code=400,
            )

    def _assert_has_tokens(self, game: Game, user_id: ResourceId, tokens: int) -> None:
        player = game.get_player(user_id)
        if player and player.tokens < tokens:
            raise UseCaseError(
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
                description = f"The game's state must be {next(iter(states))}"
            else:
                description = f"The game's state must be one of {','.join(states)}"

            raise UseCaseError(
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
            raise UseCaseError(
                code="TURN_NOT_FOUND",
                message="The turn does not exist.",
                status_code=404,
            )

        if turn_id != len(game.turns) - 1:
            raise UseCaseError(
                code="INACTIVE_TURN",
                message="The turn is not active.",
                status_code=400,
            )

    async def _get_game(self, game_id: ResourceId) -> Game:
        game = await self._repository.get(Game, game_id)
        if not game:
            raise UseCaseError(
                code="GAME_NOT_FOUND",
                message="The game does not exist.",
                status_code=404,
            )

        return game


class TrackProvidingBaseHandler(BaseHandler[TUseCase, TResult]):
    @inject
    def __init__(
        self,
        repository: Repository,
        track_provider: TrackProvider,
    ) -> None:
        super().__init__(repository)
        self._track_provider = track_provider

    async def _get_new_track(self, game: Game) -> Track:
        timeline_track_ids = {t.spotify_id for p in game.players for t in p.timeline}
        played_track_ids = {t.track.spotify_id for t in game.turns}
        exclude_track_ids = {
            *timeline_track_ids,
            *played_track_ids,
            *game.discarded_track_ids,
        }

        track = await self._track_provider.get_random_track(
            game.settings.playlists,
            exclude=exclude_track_ids,
            market=game.settings.spotify_market,
        )
        if not track:
            raise UseCaseError(
                "PLAYLISTS_EXHAUSTED",
                "There are no unplayed tracks left in the selected playlists.",
            )

        return track


class CreateGuessBaseHandler(BaseHandler[TUseCase, TResult]):
    @inject
    def __init__(
        self,
        repository: Repository,
        notifier: Notifier,
    ) -> None:
        super().__init__(repository)
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
        self,
        user_id: ResourceId,
        game: Game,
        turn_id: int,
        turn_revision: str,
        token_cost: int,
    ) -> None:
        self._assert_is_player(game, user_id)
        self._assert_has_state(game, GameState.GUESSING)
        self._assert_is_active_turn(game, turn_id)

        turn = game.turns[turn_id]
        if turn.revision_id != turn_revision:
            raise UseCaseError(
                code="TURN_REVISION_MISMATCH",
                message="The turn revision is outdated.",
                status_code=429,
            )
        if user_id in self._get_guesses(turn):
            raise UseCaseError(
                code="TURN_GUESSED",
                message="You have already guessed this item for this turn.",
                status_code=400,
            )
        if user_id in turn.passes:
            raise UseCaseError(
                code="TURN_PASSED",
                message="You have already passed for this turn.",
                status_code=400,
            )

        if token_cost > 0:
            self._assert_has_tokens(game, user_id, token_cost)
