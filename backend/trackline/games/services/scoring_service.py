import re
from typing import Protocol

from trackline.core.fields import ResourceId
from trackline.games.models import (
    ArtistsMatchMode,
    CorrectionProposalState,
    CreditsGuess,
    CreditsScoring,
    Game,
    GameSettings,
    GameState,
    Guess,
    ReleaseYearScoring,
    Scoring,
    TitleMatchMode,
    TokenGain,
    Turn,
    TurnScoring,
)
from trackline.games.utils import compare_strings, is_valid_release_year

TOKEN_GAIN_YEAR_GUESS = 1
TOKEN_GAIN_CREDITS_GUESS = 1


class Credits(Protocol):
    @property
    def artists(self) -> list[str]: ...

    @property
    def title(self) -> str: ...


class ScoringService:
    async def score_turn(self, game: Game, turn_id: int) -> TurnScoring:
        turn = game.turns[turn_id]
        if turn.scoring:
            await self._revert_scoring(game, turn_id)

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

        game.state = GameState.SCORING
        turn.scoring = turn_scoring

        return turn_scoring

    async def _revert_scoring(self, game: Game, turn_id: int) -> None:
        turn = game.turns[turn_id]
        if not turn.scoring:
            raise ValueError("The current turn was not scored, yet")

        scorings: list[Scoring] = [
            turn.scoring.release_year.position,
            turn.scoring.release_year.year,
            turn.scoring.credits,
        ]

        for player in game.players:
            for scoring in scorings:
                if token_gain := scoring.token_gains.get(player.user_id):
                    player.tokens -= token_gain.refund + token_gain.reward_effective

            player.timeline = [
                t for t in player.timeline if t.spotify_id != turn.track.spotify_id
            ]

    async def _score_position(self, game: Game, turn: Turn) -> Scoring:
        active_player = game.get_active_player()
        if not active_player:
            raise ValueError("There is no active player for the current turn")

        guesses = turn.guesses.release_year
        sorted_guesses = self._sort_guesses(guesses, turn.active_user_id)

        seen_positions: set[int] = set()
        winner: ResourceId | None = None
        token_gains: dict[ResourceId, TokenGain] = {}

        correct_release_year = self._get_correct_release_year(turn)
        correct_guesses = [
            user_id
            for user_id, guess in sorted_guesses.items()
            if is_valid_release_year(
                active_player.timeline,
                guess.position,
                correct_release_year,
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

        correct_release_year = self._get_correct_release_year(turn)
        correct_guesses = [
            user_id
            for user_id, guess in sorted_guesses.items()
            if guess.year == correct_release_year
        ]
        for user_id in sorted_guesses:
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

    def _get_correct_release_year(self, turn: Turn) -> int:
        if (
            turn.correction_proposal
            and turn.correction_proposal.state == CorrectionProposalState.ACCEPTED
        ):
            return turn.correction_proposal.release_year

        return turn.track.release_year

    def _score_credits(self, game: Game, turn: Turn) -> CreditsScoring:
        token_gains: dict[ResourceId, TokenGain] = {}

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

    def _sort_guesses[GuessT: Guess](
        self,
        guesses: dict[ResourceId, GuessT],
        active_user_id: ResourceId,
    ) -> dict[ResourceId, GuessT]:
        return dict(
            sorted(
                guesses.items(),
                key=lambda kv: (kv[0] != active_user_id, kv[1].creation_time),
            ),
        )

    def _get_credits_similarity(
        self,
        candidate: Credits,
        reference: Credits,
        settings: GameSettings,
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

        sim_title = compare_strings(
            self._transform_title(reference.title, settings.title_match_mode),
            self._transform_title(candidate.title, settings.title_match_mode),
        )
        return (sim_artists + sim_title) / 2

    def _transform_title(self, original_title: str, match_mode: TitleMatchMode) -> str:
        match match_mode:
            case TitleMatchMode.FULL:
                return original_title
            case TitleMatchMode.MAIN:
                return re.sub(r"\([^\)]+\)", "", original_title).strip()

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
