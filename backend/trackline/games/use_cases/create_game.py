from typing import Sequence

from pydantic import BaseModel

from trackline.constants import (
    DEFAULT_GUESS_TIMEOUT,
    DEFAULT_INITIAL_TOKENS,
    DEFAULT_TIMELINE_LENGTH,
)
from trackline.core.fields import ResourceId
from trackline.games.models import Game, GameSettings, Player
from trackline.games.schemas import GameOut
from trackline.games.use_cases.base import BaseHandler


class CreateGame(BaseModel):
    playlist_ids: Sequence[str]
    spotify_market: str
    initial_tokens = DEFAULT_INITIAL_TOKENS
    timeline_length = DEFAULT_TIMELINE_LENGTH
    guess_timeout = DEFAULT_GUESS_TIMEOUT

    class Handler(BaseHandler):
        async def execute(self, user_id: ResourceId, use_case: "CreateGame") -> GameOut:
            game = Game(
                settings=GameSettings(
                    playlist_ids=use_case.playlist_ids,
                    spotify_market=use_case.spotify_market,
                    initial_tokens=use_case.initial_tokens,
                    timeline_length=use_case.timeline_length,
                    guess_timeout=use_case.guess_timeout,
                ),
                players=[
                    Player(
                        user_id=user_id,
                        is_game_master=True,
                        tokens=use_case.initial_tokens,
                    ),
                ],
            )
            await self._game_repository.create(game)

            return GameOut.from_model(game)
