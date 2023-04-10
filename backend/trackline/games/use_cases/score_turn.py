from pydantic import BaseModel

from trackline.constants import (
    TOKEN_COST_POSITION_GUESS,
    TOKEN_COST_YEAR_GUESS,
    TOKEN_GAIN_YEAR_GUESS,
)
from trackline.core.fields import ResourceId
from trackline.games.models import (
    CategoryScoring,
    Game,
    Guess,
    Track,
    Turn,
    TurnScoring,
)
from trackline.games.notifier import Notifier
from trackline.games.repository import GameRepository
from trackline.games.schemas import GameState, TurnScored, TurnScoringOut
from trackline.games.use_cases.base import BaseHandler


class ScoreTurn(BaseModel):
    game_id: ResourceId
    turn_id: int

    class Handler(BaseHandler):
        def __init__(
            self,
            game_repository: GameRepository,
            notifier: Notifier,
        ) -> None:
            super().__init__(game_repository)
            self._notifier = notifier

        async def execute(
            self, user_id: ResourceId, use_case: "ScoreTurn"
        ) -> TurnScoringOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, GameState.GUESSING)
            self._assert_is_active_turn(game, use_case.turn_id)
            self._assert_is_active_player(game, use_case.turn_id, user_id)

            current_player = game.get_player(user_id)
            assert current_player

            turn = game.turns[use_case.turn_id]
            sorted_guesses = dict(
                sorted(
                    turn.guesses.items(),
                    key=lambda kv: (kv[0] != turn.active_user_id, kv[1].creation_time),
                )
            )
            tokens = {p.user_id: p.tokens for p in game.players}

            position_scoring = await self._score_position(
                game, turn, sorted_guesses, tokens
            )
            tokens = self._apply_tokens_delta(tokens, position_scoring.tokens_delta)

            release_year_scoring = self._score_release_year(
                game, turn, sorted_guesses, tokens
            )
            tokens = self._apply_tokens_delta(tokens, release_year_scoring.tokens_delta)

            tokens_delta = {
                p.user_id: tokens[p.user_id] - p.tokens
                for p in game.players
                if tokens[p.user_id] != p.tokens
            }
            await self._game_repository.inc_tokens(game.id, tokens_delta)

            scoring = TurnScoring(
                position=position_scoring,
                release_year=release_year_scoring,
            )
            await self._game_repository.set_turn_scoring(
                game.id, use_case.turn_id, scoring
            )
            await self._game_repository.update_by_id(
                game.id, {"state": GameState.SCORING}
            )

            scoring_out = TurnScoringOut.from_model(scoring)
            await self._notifier.notify(
                user_id,
                game,
                TurnScored(scoring=scoring_out),
            )

            return scoring_out

        async def _score_position(
            self,
            game: Game,
            turn: Turn,
            sorted_guesses: dict[ResourceId, Guess],
            tokens: dict[ResourceId, int],
        ) -> CategoryScoring:
            seen_positions = set()
            tokens_delta: dict[ResourceId, int] = {}
            winner: ResourceId | None = None

            for guess_user_id, guess in sorted_guesses.items():
                if guess.position is None or guess.position in seen_positions:
                    continue

                player = game.get_player(guess_user_id)
                active_player = game.get_active_player()
                if not player or not active_player:
                    continue

                is_active_player = guess_user_id == active_player.user_id
                if (
                    not is_active_player
                    and tokens[guess_user_id] < TOKEN_COST_POSITION_GUESS
                ):
                    continue

                position_correct = self._check_position(
                    active_player.timeline, turn.track, guess.position
                )
                if position_correct and not winner:
                    winner = guess_user_id
                    position = self._get_track_position(player.timeline, turn.track)
                    await self._game_repository.insert_in_timeline(
                        game.id, player.user_id, turn.track, position
                    )

                # There might be multiple correct positions. If the position is correct,
                # but there's already a winner, the player shouldn't be penalized as this
                # is the same as if they had guessed the same position.
                if not is_active_player and (not position_correct or not winner):
                    tokens_delta[guess_user_id] = -TOKEN_COST_POSITION_GUESS

                seen_positions.add(guess.position)

            return CategoryScoring(winner=winner, tokens_delta=tokens_delta)

        def _check_position(
            self, timeline: list[Track], track: Track, position: int
        ) -> bool:
            if position is None:
                return False

            if position == 0:
                min_year = 0
            else:
                min_year = timeline[position - 1].release_year

            max_year = None
            if position < len(timeline):
                max_year = timeline[position].release_year

            return min_year <= track.release_year and (
                not max_year or track.release_year <= max_year
            )

        def _score_release_year(
            self,
            game: Game,
            turn: Turn,
            sorted_guesses: dict[ResourceId, Guess],
            tokens: dict[ResourceId, int],
        ) -> CategoryScoring:
            seen_years = set()
            tokens_delta: dict[ResourceId, int] = {}
            winner: ResourceId | None = None

            for guess_user_id, guess in sorted_guesses.items():
                if guess.release_year is None or guess.release_year in seen_years:
                    continue

                player = game.get_player(guess_user_id)
                active_player = game.get_active_player()
                if not player or not active_player:
                    continue

                is_active_player = guess_user_id == active_player.user_id
                if (
                    not is_active_player
                    and tokens[guess_user_id] < TOKEN_COST_YEAR_GUESS
                ):
                    continue

                year_correct = guess.release_year == turn.track.release_year
                if year_correct and not winner:
                    winner = guess_user_id
                    tokens_delta[guess_user_id] = TOKEN_GAIN_YEAR_GUESS

                if not is_active_player and guess_user_id != winner:
                    tokens_delta[guess_user_id] = -TOKEN_COST_POSITION_GUESS

                seen_years.add(guess.release_year)

            return CategoryScoring(winner=winner, tokens_delta=tokens_delta)

        def _apply_tokens_delta(
            self, tokens: dict[ResourceId, int], delta: dict[ResourceId, int]
        ) -> dict[ResourceId, int]:
            return {
                user_id: curr_tokens + delta.get(user_id, 0)
                for user_id, curr_tokens in tokens.items()
            }
