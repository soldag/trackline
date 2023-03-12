from pydantic import BaseModel

from trackline.constants import (
    TOKEN_COST_POSITION_GUESS,
    TOKEN_COST_YEAR_GUESS,
)
from trackline.core.exceptions import UseCaseException
from trackline.games.models import Guess
from trackline.games.notifier import Notifier
from trackline.games.repository import GameRepository
from trackline.games.schemas import GameState, GuessOut, NewGuess
from trackline.games.use_cases.base import BaseHandler


class CreateGuess(BaseModel):
    game_id: str
    turn_id: int
    position: int | None
    release_year: int | None

    class Handler(BaseHandler):
        def __init__(
            self,
            game_repository: GameRepository,
            notifier: Notifier,
        ) -> None:
            super().__init__(game_repository)
            self._notifier = notifier

        async def execute(self, user_id: str, use_case: "CreateGuess") -> GuessOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, GameState.GUESSING)
            self._assert_is_active_turn(game, use_case.turn_id)

            turn = game.turns[use_case.turn_id]
            if user_id in turn.guesses:
                raise UseCaseException(
                    code="GUESSED_ALREADY",
                    description="You can only guess once per turn.",
                    status_code=400,
                )

            active_player = game.get_active_player()
            if (
                use_case.position is not None
                and active_player is not None
                and use_case.position > len(active_player.timeline)
            ):
                raise UseCaseException(
                    code="INVALID_POSITION",
                    description="This position exceeds the boundaries of the timeline.",
                    status_code=400,
                )

            min_cost = min(TOKEN_COST_POSITION_GUESS, TOKEN_COST_YEAR_GUESS)
            is_rejection = use_case.position is None and use_case.release_year is None
            if not is_rejection and user_id != turn.active_user_id:
                self._assert_has_tokens(game, user_id, min_cost)

            guess = Guess(
                position=use_case.position,
                release_year=use_case.release_year,
            )
            await self._game_repository.add_guess(
                game.id, use_case.turn_id, user_id, guess
            )

            guess_out = GuessOut.from_model(guess, user_id)
            await self._notifier.notify(
                user_id,
                game,
                NewGuess(guess=guess_out),
            )

            return guess_out
