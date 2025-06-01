from collections import defaultdict
from uuid import uuid4

from injector import Inject
from pydantic import BaseModel

from trackline.constants import TOKEN_COST_EXCHANGE_TRACK
from trackline.core.db.repository import Repository
from trackline.core.fields import ResourceId
from trackline.games.schemas import (
    GameState,
    TrackExchanged,
    TrackExchangeOut,
    TrackOut,
)
from trackline.games.services.notifier import Notifier
from trackline.games.services.track_provider import TrackProvider
from trackline.games.use_cases.base import TrackProvidingBaseHandler


class ExchangeTrack(BaseModel):
    game_id: ResourceId
    turn_id: int

    class Handler(TrackProvidingBaseHandler):
        def __init__(
            self,
            repository: Inject[Repository],
            track_provider: Inject[TrackProvider],
            notifier: Inject[Notifier],
        ) -> None:
            super().__init__(repository, track_provider)
            self._notifier = notifier

        async def execute(
            self, user_id: ResourceId, use_case: "ExchangeTrack"
        ) -> TrackExchangeOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, GameState.GUESSING)
            self._assert_is_active_turn(game, use_case.turn_id)
            self._assert_is_active_player(game, use_case.turn_id, user_id)
            self._assert_has_not_passed(game, use_case.turn_id, user_id)
            self._assert_has_tokens(game, user_id, TOKEN_COST_EXCHANGE_TRACK)

            current_player = game.get_player(user_id)
            assert current_player

            turn = game.turns[use_case.turn_id]
            token_delta = defaultdict(
                lambda: 0,
                {
                    user_id: -TOKEN_COST_EXCHANGE_TRACK,
                },
            )
            for guess_user_id, release_year_guess in turn.guesses.release_year.items():
                token_delta[guess_user_id] += release_year_guess.token_cost
            for guess_user_id, credits_guess in turn.guesses.credits.items():
                token_delta[guess_user_id] += credits_guess.token_cost
            for player in game.players:
                player.tokens += token_delta.get(player.user_id, 0)

            new_track = await self._get_new_track(game)
            new_revision_id = str(uuid4())
            game.discarded_track_ids.append(turn.track.spotify_id)
            turn.track = new_track
            turn.revision_id = new_revision_id
            turn.guesses.release_year.clear()
            turn.guesses.credits.clear()
            turn.passes.clear()

            new_track_out = TrackOut.from_model(new_track)
            await self._notifier.notify(
                user_id,
                game,
                TrackExchanged(
                    turn_revision_id=new_revision_id,
                    track=new_track_out,
                    token_delta=token_delta,
                ),
            )

            return TrackExchangeOut(
                turn_revision_id=new_revision_id,
                track=new_track_out,
                token_delta=token_delta,
            )
