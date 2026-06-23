from collections.abc import Mapping

from trackline.core.exceptions import UseCaseError
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.constants import TOKEN_COST_GUESS_RELEASE_YEAR
from trackline.games.models import Guess, ReleaseYearGuess, Turn
from trackline.games.schemas import ReleaseYearGuessCreated, ReleaseYearGuessOut
from trackline.games.use_cases.base import CreateGuessBaseHandler


class CreateReleaseYearGuess(AuthenticatedUseCase[ReleaseYearGuessOut]):
    game_id: ResourceId
    turn_id: int
    turn_revision_id: str
    prev_track_id: str | None = None
    next_track_id: str | None = None
    year: int


@CreateReleaseYearGuess.register_handler
class Handler(CreateGuessBaseHandler[CreateReleaseYearGuess, ReleaseYearGuessOut]):
    def _get_guesses(self, turn: Turn) -> Mapping[ResourceId, Guess]:
        return turn.guesses.release_year

    async def execute(
        self, user_id: ResourceId, use_case: CreateReleaseYearGuess
    ) -> ReleaseYearGuessOut:
        game = await self._get_game(use_case.game_id)
        token_cost = self._get_token_cost(user_id, game, TOKEN_COST_GUESS_RELEASE_YEAR)
        self._assert_can_guess(
            user_id,
            game,
            use_case.turn_id,
            use_case.turn_revision_id,
            token_cost,
        )

        active_player = game.get_active_player()
        if not active_player:
            raise UseCaseError(
                code="NO_ACTIVE_PLAYER",
                message="There is no active player in this game.",
                status_code=400,
            )

        tracks_by_id = {track.spotify_id: track for track in active_player.timeline}

        prev_track = None
        if use_case.prev_track_id is not None:
            prev_track = tracks_by_id.get(use_case.prev_track_id)
            if not prev_track:
                raise UseCaseError(
                    code="INVALID_POSITION",
                    message="The previous track is not part of the timeline.",
                    status_code=400,
                )

        next_track = None
        if use_case.next_track_id is not None:
            next_track = tracks_by_id.get(use_case.next_track_id)
            if not next_track:
                raise UseCaseError(
                    code="INVALID_POSITION",
                    message="The next track is not part of the timeline.",
                    status_code=400,
                )

        if prev_track and next_track:
            timeline = active_player.timeline
            if timeline.index(next_track) - timeline.index(prev_track) != 1:
                raise UseCaseError(
                    code="INVALID_POSITION",
                    message="The previous and next track are not subsequent.",
                    status_code=400,
                )

        if (prev_track and prev_track.release_year > use_case.year) or (
            next_track and next_track.release_year < use_case.year
        ):
            raise UseCaseError(
                code="INVALID_RELEASE_YEAR",
                message=(
                    "This release year is not within the boundaries "
                    "determined by the position."
                ),
                status_code=400,
            )

        guess = ReleaseYearGuess(
            token_cost=token_cost,
            prev_track_id=use_case.prev_track_id,
            next_track_id=use_case.next_track_id,
            year=use_case.year,
        )
        game.turns[use_case.turn_id].guesses.release_year[user_id] = guess

        if token_cost > 0:
            current_player = game.get_player(user_id)
            current_player.tokens -= guess.token_cost

        guess_out = ReleaseYearGuessOut.from_model(guess, user_id)
        await self._notifier.notify(
            user_id,
            game,
            ReleaseYearGuessCreated(guess=guess_out),
        )

        return guess_out
