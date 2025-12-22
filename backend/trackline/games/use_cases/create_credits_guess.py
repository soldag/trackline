from collections.abc import Mapping

from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.constants import TOKEN_COST_GUESS_CREDITS
from trackline.games.models import CreditsGuess, Guess, Turn
from trackline.games.schemas import CreditsGuessCreated, CreditsGuessOut
from trackline.games.use_cases.base import CreateGuessBaseHandler


class CreateCreditsGuess(AuthenticatedUseCase[CreditsGuessOut]):
    game_id: ResourceId
    turn_id: int
    turn_revision_id: str
    artists: list[str]
    title: str


@CreateCreditsGuess.register_handler
class Handler(CreateGuessBaseHandler[CreateCreditsGuess, CreditsGuessOut]):
    def _get_guesses(self, turn: Turn) -> Mapping[ResourceId, Guess]:
        return turn.guesses.credits

    async def execute(
        self,
        user_id: ResourceId,
        use_case: CreateCreditsGuess,
    ) -> CreditsGuessOut:
        game = await self._get_game(use_case.game_id)
        token_cost = self._get_token_cost(user_id, game, TOKEN_COST_GUESS_CREDITS)
        self._assert_can_guess(
            user_id,
            game,
            use_case.turn_id,
            use_case.turn_revision_id,
            token_cost,
        )

        guess = CreditsGuess(
            token_cost=token_cost,
            artists=use_case.artists,
            title=use_case.title,
        )
        game.turns[use_case.turn_id].guesses.credits[user_id] = guess

        if token_cost > 0:
            current_player = game.get_player(user_id)
            current_player.tokens -= guess.token_cost

        guess_out = CreditsGuessOut.from_model(guess, user_id)
        await self._notifier.notify(
            user_id,
            game,
            CreditsGuessCreated(guess=guess_out),
        )

        return guess_out
