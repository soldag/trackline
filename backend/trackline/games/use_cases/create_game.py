import random
from typing import Annotated

from annotated_types import Len
from injector import inject

from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseError
from trackline.core.fields import Fraction, ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.constants import JOIN_CODE_CHARACTERS, JOIN_CODE_LENGTH
from trackline.games.models import (
    ArtistsMatchMode,
    Game,
    GameSettings,
    GameState,
    Player,
    Playlist,
    TitleMatchMode,
)
from trackline.games.schemas import GameOut
from trackline.games.services.track_provider import TrackProvider
from trackline.games.use_cases.base import BaseHandler
from trackline.spotify.services.spotify_client import (
    PlaylistNotFoundError,
    SpotifyClient,
)


class CreateGame(AuthenticatedUseCase[GameOut]):
    playlist_ids: Annotated[list[str], Len(min_length=1)]
    spotify_market: str
    initial_tokens: int = 2
    max_tokens: int = 5
    timeline_length: int = 10
    guess_timeout: int = 30000
    artists_match_mode: ArtistsMatchMode = ArtistsMatchMode.ONE
    title_match_mode: TitleMatchMode = TitleMatchMode.MAIN
    credits_similarity_threshold: Fraction = 0.9
    credits_filter_stop_words: bool = True
    enable_catch_up: bool = True


@CreateGame.register_handler
class Handler(BaseHandler[CreateGame, GameOut]):
    @inject
    def __init__(
        self,
        repository: Repository,
        track_provider: TrackProvider,
        spotify_client: SpotifyClient,
    ) -> None:
        super().__init__(repository)
        self._track_provider = track_provider
        self._spotify_client = spotify_client

    async def execute(self, user_id: ResourceId, use_case: CreateGame) -> GameOut:
        join_code = await self._get_random_join_code()
        playlists = await self._get_playlists(
            use_case.playlist_ids,
            use_case.spotify_market,
        )

        game = Game(
            join_code=join_code,
            settings=GameSettings(
                playlists=playlists,
                spotify_market=use_case.spotify_market,
                initial_tokens=use_case.initial_tokens,
                max_tokens=use_case.max_tokens,
                timeline_length=use_case.timeline_length,
                guess_timeout=use_case.guess_timeout,
                artists_match_mode=use_case.artists_match_mode,
                title_match_mode=use_case.title_match_mode,
                credits_similarity_threshold=use_case.credits_similarity_threshold,
                credits_filter_stop_words=use_case.credits_filter_stop_words,
                enable_catchup=use_case.enable_catch_up,
            ),
            players=[
                Player(
                    user_id=user_id,
                    is_game_master=True,
                    tokens=use_case.initial_tokens,
                ),
            ],
        )
        await self._repository.create(game)

        self._track_provider.replenish_cache(game)

        return GameOut.from_model(game)

    async def _get_random_join_code(self) -> str:
        for _ in range(3):
            join_code = "".join(
                random.choice(JOIN_CODE_CHARACTERS)  # noqa: S311
                for _ in range(JOIN_CODE_LENGTH)
            )

            game = await self._repository.get_one(
                Game,
                {
                    "join_code": join_code,
                    "state": GameState.WAITING_FOR_PLAYERS,
                },
            )
            if not game:
                return join_code

        raise RuntimeError("Failed to generate random join code")

    async def _get_playlists(
        self,
        playlist_ids: list[str],
        spotify_market: str,
    ) -> list[Playlist]:
        playlists: list[Playlist] = []
        for playlist_id in playlist_ids:
            try:
                track_count = await self._spotify_client.get_playlist_total_tracks(
                    playlist_id,
                    market=spotify_market,
                )
            except PlaylistNotFoundError as e:
                raise UseCaseError(
                    code="PLAYLIST_NOT_FOUND",
                    message=f"The playlist {playlist_id} does not exist.",
                ) from e

            playlist = Playlist(
                spotify_id=playlist_id,
                track_count=track_count,
            )
            playlists.append(playlist)

        return playlists
