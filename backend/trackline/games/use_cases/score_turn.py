import re
from typing import Protocol, TypeVar

from injector import Inject
from pydantic import BaseModel

from trackline.constants import (
    TOKEN_GAIN_CREDITS_GUESS,
    TOKEN_GAIN_YEAR_GUESS,
)
from trackline.core.db.client import DatabaseClient
from trackline.core.fields import ResourceId
from trackline.games.models import (
    ArtistsMatchMode,
    CreditsGuess,
    CreditsScoring,
    Game,
    GameSettings,
    Guess,
    ReleaseYearScoring,
    Scoring,
    TitleMatchMode,
    TokenGain,
    Turn,
    TurnScoring,
)
from trackline.games.schemas import GameState, TurnScored, TurnScoringOut
from trackline.games.services.notifier import Notifier
from trackline.games.use_cases.base import BaseHandler
from trackline.games.utils import compare_strings, is_valid_release_year


GuessT = TypeVar("GuessT", bound=Guess)
ScoringT = TypeVar("ScoringT", bound=Scoring)


class Credits(Protocol):
    @property
    def artists(self) -> list[str]: ...

    @property
    def title(self) -> str: ...


class ScoreTurn(BaseModel):
    game_id: ResourceId
    turn_id: int

    class Handler(BaseHandler):
        def __init__(
            self,
            db: Inject[DatabaseClient],
            notifier: Inject[Notifier],
        ) -> None:
            super().__init__(db)
            self._notifier = notifier

        async def execute(
            self, user_id: ResourceId, use_case: "ScoreTurn"
        ) -> TurnScoringOut:
            game_id = use_case.game_id
            turn_id = use_case.turn_id

            game = await self._get_game(game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, GameState.GUESSING)
            self._assert_is_active_turn(game, turn_id)
            self._assert_is_active_player(game, turn_id, user_id)

            current_player = game.get_player(user_id)
            assert current_player

            turn = game.turns[use_case.turn_id]
            scoring = await self._score_game(game, turn)

            game.state = GameState.SCORING
            turn.scoring = scoring
            await game.save_changes(session=self._db.session)

            scoring_out = TurnScoringOut.from_model(scoring)
            await self._notifier.notify(
                user_id,
                game,
                TurnScored(scoring=scoring_out),
            )

            return scoring_out

        async def _score_game(self, game: Game, turn: Turn) -> TurnScoring:
            position_scoring = await self._score_position(game, turn)
            release_year_scoring = self._score_release_year(turn)
            credits_scoring = self._score_credits(game, turn)

            turn_scoring = TurnScoring(
                release_year=ReleaseYearScoring(
                    position=position_scoring,
                    year=release_year_scoring,
                ),
                credits=credits_scoring,
            )
            self._apply_token_limit(game, turn_scoring)

            return turn_scoring

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

        async def _score_position(self, game: Game, turn: Turn) -> Scoring:
            active_player = game.get_active_player()
            assert active_player

            guesses = turn.guesses.release_year
            sorted_guesses = self._sort_guesses(guesses, turn.active_user_id)

            seen_positions: set[int] = set()
            winner: ResourceId | None = None
            token_gains: dict[ResourceId, TokenGain] = {}

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
                    player.add_to_timeline(turn.track)
                elif is_correct or is_duplicate:
                    # Duplicate guesses are ignored and these players get
                    # their spent token back. There might be multiple correct
                    # positions that's why we also need to check for is_correct.
                    token_gains[user_id] = TokenGain(refund=guess.token_cost)

                seen_positions.add(guess.position)

            return Scoring(
                winner=winner,
                correct_guesses=correct_guesses,
                token_gains=token_gains,
            )

        def _score_release_year(self, turn: Turn) -> Scoring:
            winner: ResourceId | None = None
            token_gains: dict[ResourceId, TokenGain] = {}

            guesses = turn.guesses.release_year
            sorted_guesses = self._sort_guesses(guesses, turn.active_user_id)

            correct_guesses = [
                user_id
                for user_id, guess in sorted_guesses.items()
                if guess.year == turn.track.release_year
            ]
            for user_id in sorted_guesses.keys():
                if user_id in correct_guesses:
                    winner = user_id
                    token_gains[user_id] = TokenGain(
                        reward_effective=TOKEN_GAIN_YEAR_GUESS,
                        reward_theoretical=TOKEN_GAIN_YEAR_GUESS,
                    )
                    break

            return Scoring(
                winner=winner,
                correct_guesses=correct_guesses,
                token_gains=token_gains,
            )

        def _score_credits(self, game: Game, turn: Turn) -> CreditsScoring:
            token_gains: dict[ResourceId, TokenGain] = {}

            active_player = game.get_active_player()
            assert active_player

            guesses = turn.guesses.credits
            sorted_guesses = self._sort_guesses(guesses, turn.active_user_id)

            winner: ResourceId | None = None
            similarity_scores = {
                user_id: self._get_credits_similarity(guess, turn.track, game.settings)
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
                    self._get_credits_similarity(guess, seen_guess, game.settings)
                    for seen_guess in seen_guesses
                ]
                is_duplicate = any(
                    similarity >= game.settings.credits_similarity_threshold
                    for similarity in seen_guesses_similarities
                )
                if is_correct and not winner:
                    winner = user_id
                    token_gains[user_id] = TokenGain(
                        refund=guess.token_cost,
                        reward_effective=TOKEN_GAIN_CREDITS_GUESS,
                        reward_theoretical=TOKEN_GAIN_CREDITS_GUESS,
                    )
                elif is_correct or is_duplicate:
                    # Duplicate guesses are ignored and these players get
                    # their spent token back
                    token_gains[user_id] = TokenGain(refund=guess.token_cost)

                seen_guesses.append(guess)

            return CreditsScoring(
                winner=winner,
                correct_guesses=correct_credits,
                token_gains=token_gains,
                similarity_scores=similarity_scores,
            )

        def _get_credits_similarity(
            self, candidate: Credits, reference: Credits, settings: GameSettings
        ) -> float:
            sim_all_artists = [
                max(
                    compare_strings(candidate_artist, reference_artist)
                    for candidate_artist in candidate.artists
                )
                for reference_artist in reference.artists
            ]
            match settings.artists_match_mode:
                case ArtistsMatchMode.ALL:
                    sim_artists = sum(sim_all_artists) / len(reference.artists)
                case ArtistsMatchMode.ONE:
                    sim_artists = max(sim_all_artists)

            sim_all_titles = [
                compare_strings(reference_title, candidate_title)
                for reference_title in self._transform_title(reference.title, settings)
                for candidate_title in self._transform_title(candidate.title, settings)
            ]
            sim_title = max(sim_all_titles)

            return (sim_artists + sim_title) / 2

        def _transform_title(
            self, original_title: str, settings: GameSettings
        ) -> set[str]:
            result = {original_title}

            if settings.title_match_mode == TitleMatchMode.MAIN:
                result.add(re.sub(r"\([^\)]+\)", "", original_title))
                result.add(re.sub(r" - (.*)$", "", original_title))

            return result

        def _apply_token_limit(self, game: Game, turn_scoring: TurnScoring) -> None:
            scorings = (
                turn_scoring.release_year.position,
                turn_scoring.release_year.year,
                turn_scoring.credits,
            )

            for scoring in scorings:
                for user_id, token_gain in scoring.token_gains.items():
                    if player := game.get_player(user_id):
                        player.tokens += token_gain.refund

            for scoring in scorings:
                for user_id, token_gain in scoring.token_gains.items():
                    if player := game.get_player(user_id):
                        token_gain.reward_effective = min(
                            token_gain.reward_theoretical,
                            max(0, game.settings.max_tokens - player.tokens),
                        )
                        player.tokens += token_gain.reward_effective
