from collections.abc import Mapping

from pydantic import BaseModel

from trackline.core.exceptions import UseCaseError
from trackline.core.fields import ResourceId
from trackline.games.models import Guess, ReleaseYearGuess, Turn
from trackline.games.schemas import ReleaseYearGuessCreated, ReleaseYearGuessOut
from trackline.games.use_cases.base import CreateGuessBaseHandler
from trackline.games.utils import is_valid_release_year

TOKEN_COST = 1


class CreateReleaseYearGuess(BaseModel):
    game_id: ResourceId
    turn_id: int
    turn_revision_id: str
    position: int
    year: int

    class Handler(CreateGuessBaseHandler):
        def _get_guesses(self, turn: Turn) -> Mapping[ResourceId, Guess]:
            return turn.guesses.release_year

        async def execute(
            self,
            user_id: ResourceId,
            use_case: "CreateReleaseYearGuess",
        ) -> ReleaseYearGuessOut:
            game = await self._get_game(use_case.game_id)
            token_cost = self._get_token_cost(user_id, game, TOKEN_COST)
            self._assert_can_guess(
                user_id,
                game,
                use_case.turn_id,
                use_case.turn_revision_id,
                token_cost,
            )

            active_player = game.get_active_player()
            if active_player and use_case.position > len(active_player.timeline):
                raise UseCaseError(
                    code="INVALID_POSITION",
                    message="This position exceeds the boundaries of the timeline.",
                    status_code=400,
                )

            if active_player and not is_valid_release_year(
                active_player.timeline,
                use_case.position,
                use_case.year,
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
                position=use_case.position,
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
