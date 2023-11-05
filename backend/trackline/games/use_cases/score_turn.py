from collections import defaultdict
from typing import TypeVar

from injector import Inject
from pydantic import BaseModel

from trackline.constants import (
    TOKEN_GAIN_CREDITS_GUESS,
    TOKEN_GAIN_YEAR_GUESS,
)
from trackline.core.fields import ResourceId
from trackline.games.models import (
    ArtistsMatchMode,
    CreditsGuess,
    CreditsScoring,
    Game,
    GameSettings,
    Guess,
    ReleaseYearGuess,
    ReleaseYearScoring,
    Scoring,
    Track,
    Turn,
    TurnScoring,
)
from trackline.games.notifier import Notifier
from trackline.games.repository import GameRepository
from trackline.games.schemas import GameState, TurnScored, TurnScoringOut
from trackline.games.string_similarity import compare_strings
from trackline.games.use_cases.base import BaseHandler
from trackline.games.utils import is_valid_release_year


GuessT = TypeVar("GuessT", bound=Guess)


class ScoreTurn(BaseModel):
    game_id: ResourceId
    turn_id: int

    class Handler(BaseHandler):
        def __init__(
            self,
            game_repository: Inject[GameRepository],
            notifier: Inject[Notifier],
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
            release_year_scoring = await self._score_release_year(game, turn)
            credits_scoring = self._score_credits(game, turn)

            token_gain = self._merge_token_gain(
                release_year_scoring.position.token_gain,
                release_year_scoring.year.token_gain,
                credits_scoring.token_gain,
            )
            await self._game_repository.inc_tokens(game.id, token_gain)

            scoring = TurnScoring(
                release_year=release_year_scoring,
                credits=credits_scoring,
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

        def _sort_guesses(
            self,
            guesses: dict[ResourceId, GuessT],
            active_user_id: ResourceId,
        ) -> dict[ResourceId, GuessT]:
            return dict(
                sorted(
                    guesses.items(),
                    key=lambda kv: (kv[0] != active_user_id, kv[1].creation_time),
                )
            )

        async def _score_release_year(
            self,
            game: Game,
            turn: Turn,
        ) -> ReleaseYearScoring:
            guesses = turn.guesses.release_year
            sorted_guesses = self._sort_guesses(guesses, turn.active_user_id)

            position_scoring = await self._score_release_year_position(
                game, turn, sorted_guesses
            )
            year_scoring = self._score_release_year_year(turn, sorted_guesses)

            return ReleaseYearScoring(position=position_scoring, year=year_scoring)

        async def _score_release_year_position(
            self,
            game: Game,
            turn: Turn,
            sorted_guesses: dict[ResourceId, ReleaseYearGuess],
        ) -> Scoring:
            active_player = game.get_active_player()
            assert active_player

            seen_positions: set[int] = set()
            winner: ResourceId | None = None
            token_gain: dict[ResourceId, int] = {}

            correct_guesses = [
                user_id
                for user_id, guess in sorted_guesses.items()
                if is_valid_release_year(
                    active_player.timeline, guess.position, turn.track.release_year
                )
            ]
            for user_id, guess in sorted_guesses.items():
                player = game.get_player(user_id)
                if not player:
                    continue

                is_correct = user_id in correct_guesses
                is_duplicate = guess.position in seen_positions
                if is_correct and not winner:
                    winner = user_id
                    position = self._get_track_position(player.timeline, turn.track)
                    await self._game_repository.insert_in_timeline(
                        game.id, player.user_id, turn.track, position
                    )
                elif is_correct or is_duplicate:
                    # Duplicate guesses are ignored and these players get
                    # their spent token back. There might be multiple correct
                    # positions that's why we also need to check for is_correct.
                    token_gain[user_id] = guess.token_cost

                seen_positions.add(guess.position)

            return Scoring(
                winner=winner,
                correct_guesses=correct_guesses,
                token_gain=token_gain,
            )

        def _score_release_year_year(
            self,
            turn: Turn,
            sorted_guesses: dict[ResourceId, ReleaseYearGuess],
        ) -> Scoring:
            winner: ResourceId | None = None
            token_gain: dict[ResourceId, int] = {}

            correct_guesses = [
                user_id
                for user_id, guess in sorted_guesses.items()
                if guess.year == turn.track.release_year
            ]
            for user_id in sorted_guesses.keys():
                if user_id in correct_guesses:
                    winner = user_id
                    token_gain[user_id] = TOKEN_GAIN_YEAR_GUESS
                    break

            return Scoring(
                winner=winner,
                correct_guesses=correct_guesses,
                token_gain=token_gain,
            )

        def _score_credits(
            self,
            game: Game,
            turn: Turn,
        ) -> CreditsScoring:
            token_gain: dict[ResourceId, int] = defaultdict(lambda: 0)

            active_player = game.get_active_player()
            assert active_player

            guesses = turn.guesses.credits
            sorted_guesses = self._sort_guesses(guesses, turn.active_user_id)

            winner: ResourceId | None = None
            similarity_scores = {
                user_id: self._get_credits_similarity(turn.track, guess, game.settings)
                for user_id, guess in guesses.items()
            }
            correct_credits = [
                user_id
                for user_id, similarity in similarity_scores.items()
                if similarity >= game.settings.credits_similarity_threshold
            ]

            seen_guesses: list[CreditsGuess] = []
            for user_id, guess in sorted_guesses.items():
                player = game.get_player(user_id)
                if not player:
                    continue

                is_correct = user_id in correct_credits
                seen_guesses_similarities = [
                    self._get_credits_similarity(turn.track, guess, game.settings)
                    for guess in seen_guesses
                ]
                is_duplicate = any(
                    similarity >= game.settings.credits_similarity_threshold
                    for similarity in seen_guesses_similarities
                )
                if is_correct and not winner:
                    winner = user_id
                    token_gain[user_id] = TOKEN_GAIN_CREDITS_GUESS
                    if user_id != active_player.user_id:
                        # Passive players get their stake back
                        token_gain[user_id] += guess.token_cost
                elif is_correct or is_duplicate:
                    # Duplicate guesses are ignored and these players get
                    # their spent token back
                    token_gain[user_id] = guess.token_cost

                seen_guesses.append(guess)

            return CreditsScoring(
                token_gain=token_gain,
                winner=winner,
                correct_guesses=correct_credits,
                similarity_scores=similarity_scores,
            )

        def _get_credits_similarity(
            self, track: Track, guess: CreditsGuess, settings: GameSettings
        ) -> float:
            sim_all_artists = [
                max(
                    compare_strings(track_artist, guess_artist)
                    for guess_artist in guess.artists
                )
                for track_artist in track.artists
            ]
            match settings.artists_match_mode:
                case ArtistsMatchMode.ALL:
                    sim_artists = sum(sim_all_artists) / len(track.artists)
                case ArtistsMatchMode.ONE:
                    sim_artists = max(sim_all_artists)

            sim_title = compare_strings(track.title, guess.title)
            return (sim_artists + sim_title) / 2

        def _merge_token_gain(
            self, *deltas: dict[ResourceId, int]
        ) -> dict[ResourceId, int]:
            result: dict[ResourceId, int] = {}
            for delta in deltas:
                for user_id, token_delta in delta.items():
                    result[user_id] = result.get(user_id, 0) + token_delta

            return result
