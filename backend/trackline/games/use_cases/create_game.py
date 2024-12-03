from pydantic import BaseModel

from trackline.constants import (
    DEFAULT_ARTISTS_MATCH_MODE,
    DEFAULT_CREDITS_SIMILARITY_THRESHOLD,
    DEFAULT_GUESS_TIMEOUT,
    DEFAULT_INITIAL_TOKENS,
    DEFAULT_MAX_TOKENS,
    DEFAULT_TIMELINE_LENGTH,
    DEFAULT_TITLE_MATCH_MODE,
)
from trackline.core.fields import Fraction, ResourceId
from trackline.games.models import (
    ArtistsMatchMode,
    Game,
    GameSettings,
    Player,
    TitleMatchMode,
)
from trackline.games.schemas import GameOut
from trackline.games.use_cases.base import BaseHandler


class CreateGame(BaseModel):
    playlist_ids: list[str]
    spotify_market: str
    initial_tokens: int = DEFAULT_INITIAL_TOKENS
    max_tokens: int = DEFAULT_MAX_TOKENS
    timeline_length: int = DEFAULT_TIMELINE_LENGTH
    guess_timeout: int = DEFAULT_GUESS_TIMEOUT
    artists_match_mode: ArtistsMatchMode = DEFAULT_ARTISTS_MATCH_MODE
    title_match_mode: TitleMatchMode = DEFAULT_TITLE_MATCH_MODE
    credits_similarity_threshold: Fraction = DEFAULT_CREDITS_SIMILARITY_THRESHOLD

    class Handler(BaseHandler):
        async def execute(self, user_id: ResourceId, use_case: "CreateGame") -> GameOut:
            game = Game(
                settings=GameSettings(
                    playlist_ids=use_case.playlist_ids,
                    spotify_market=use_case.spotify_market,
                    initial_tokens=use_case.initial_tokens,
                    max_tokens=use_case.max_tokens,
                    timeline_length=use_case.timeline_length,
                    guess_timeout=use_case.guess_timeout,
                    artists_match_mode=use_case.artists_match_mode,
                    title_match_mode=use_case.title_match_mode,
                    credits_similarity_threshold=use_case.credits_similarity_threshold,
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
