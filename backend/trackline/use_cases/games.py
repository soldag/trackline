from collections import defaultdict
from datetime import datetime
from typing import Collection, Dict, List, Sequence, Tuple

from pydantic import BaseModel

from trackline.constants import TARGET_TIMELINE_LENGTH
from trackline.models.games import Game, GameSettings, Guess, Player, Track, Turn
from trackline.schema.games import (
    GameAborted,
    GameOut,
    GameStarted,
    GameState,
    GuessOut,
    NewGuess,
    NewTurn,
    PlayerJoined,
    PlayerLeft,
    PlayerOut,
    TurnOut,
    TurnScored,
    TurnScoringOut,
)
from trackline.schema.users import UserOut
from trackline.services.notifier import NotificationChannel, Notifier
from trackline.services.repositories import GameRepository, UserRepository
from trackline.services.spotify import SpotifyService
from trackline.utils.exceptions import UseCaseException


class BaseHandler:
    def __init__(self, game_repository: GameRepository) -> None:
        self._game_repository = game_repository

    def _assert_is_player(self, game: Game, user_id: str) -> None:
        player_ids = [p.user_id for p in game.players]
        if not user_id or user_id not in player_ids:
            raise UseCaseException(
                code="GAME_NOT_FOUND",
                description="The game does not exist.",
                status_code=404,
            )

    def _assert_is_game_master(self, game: Game, user_id: str) -> None:
        self._assert_is_player(game, user_id)
        if not any(p.user_id == user_id and p.is_game_master for p in game.players):
            raise UseCaseException(
                code="NO_GAME_MASTER",
                description="Only the game master can perform this operation.",
                status_code=403,
            )

    def _assert_has_state(
        self,
        game: Game,
        state: GameState | Collection[GameState],
    ) -> None:
        states = [state] if isinstance(state, GameState) else state
        if all(game.state != s for s in states):
            if len(states) == 1:
                description = f"The game's state must be {list(states)[0]}"
            else:
                description = f"The game's state must be one of {','.join(states)}"

            raise UseCaseException(
                code="UNEXPECTED_STATE",
                description=description,
                status_code=400,
            )

    def _assert_has_not_state(
        self,
        game: Game,
        state: GameState | Sequence[GameState],
    ) -> None:
        forbidden_states = [state] if isinstance(state, GameState) else state
        allowed_states = set(GameState) - set(forbidden_states)
        self._assert_has_state(game, allowed_states)

    def _assert_is_active_turn(self, game: Game, turn_id: int) -> None:
        if not game.turns:
            raise UseCaseException(
                code="TURN_NOT_FOUND",
                description="The turn does not exist.",
                status_code=404,
            )

        if turn_id != len(game.turns) - 1:
            raise UseCaseException(
                code="INACTIVE_TURN",
                description="The turn is not active.",
                status_code=400,
            )

    async def _get_game(self, game_id: str) -> Game:
        game = await self._game_repository.find_by_id(game_id)
        if not game:
            raise UseCaseException(
                code="GAME_NOT_FOUND",
                description="The game does not exist.",
                status_code=404,
            )

        return game


class CreateGame(BaseModel):
    playlist_ids: Sequence[str]
    spotify_market: str

    class Handler(BaseHandler):
        async def execute(self, user_id: str, use_case: "CreateGame") -> GameOut:
            game = Game(
                settings=GameSettings(
                    playlist_ids=use_case.playlist_ids,
                    spotify_market=use_case.spotify_market,
                ),
                players=[
                    Player(user_id=user_id, is_game_master=True),
                ],
            )
            await self._game_repository.create(game)

            return GameOut.from_model(game)


class GetGame(BaseModel):
    game_id: str

    class Handler(BaseHandler):
        async def execute(self, user_id: str, use_case: "GetGame") -> GameOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)

            return GameOut.from_model(game)


class GetGameUsers(BaseModel):
    game_id: str

    class Handler(BaseHandler):
        def __init__(
            self,
            game_repository: GameRepository,
            user_repository: UserRepository,
        ) -> None:
            super().__init__(game_repository)
            self.user_repository = user_repository

        async def execute(
            self, user_id: str, use_case: "GetGameUsers"
        ) -> List[UserOut]:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)

            user_ids = [player.user_id for player in game.players]
            users = await self.user_repository.find_by_ids(user_ids)

            return [UserOut.from_model(user) for user in users]


class JoinGame(BaseModel):
    game_id: str

    class Handler(BaseHandler):
        def __init__(
            self,
            game_repository: GameRepository,
            user_repository: UserRepository,
            notifier: Notifier,
        ) -> None:
            super().__init__(game_repository)
            self._user_repository = user_repository
            self._notifier = notifier

        async def execute(self, user_id: str, use_case: "JoinGame") -> PlayerOut:
            game = await self._get_game(use_case.game_id)
            user_ids = [p.user_id for p in game.players]
            if user_id in user_ids:
                raise UseCaseException(
                    code="ALREADY_JOINED",
                    description="You have joined this game already.",
                    status_code=400,
                )

            player = Player(user_id=user_id, is_game_master=False)
            await self._game_repository.add_player(game.id, player)

            user = await self._user_repository.find_by_id(user_id)
            user_out = UserOut.from_model(user) if user else None
            player_out = PlayerOut.from_model(player)
            await self._notifier.notify(
                user_id,
                game,
                PlayerJoined(user=user_out, player=player_out),
            )

            return player_out


class LeaveGame(BaseModel):
    game_id: str

    class Handler(BaseHandler):
        def __init__(self, game_repository: GameRepository, notifier: Notifier) -> None:
            super().__init__(game_repository)
            self._notifier = notifier

        async def execute(self, user_id: str, use_case: "LeaveGame") -> None:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)

            game_master = next((p for p in game.players if p.is_game_master), None)
            if game_master and game_master.user_id == user_id:
                raise UseCaseException(
                    code="GAME_MASTER_CANNOT_LEAVE",
                    description="The game master cannot leave the game",
                    status_code=400,
                )

            await self._game_repository.remove_player(game.id, user_id)

            await self._notifier.notify(
                user_id,
                game,
                PlayerLeft(user_id=user_id),
            )


class StartGame(BaseModel):
    game_id: str

    class Handler(BaseHandler):
        def __init__(
            self,
            game_repository: GameRepository,
            spotify_service: SpotifyService,
            notifier: Notifier,
        ) -> None:
            super().__init__(game_repository)
            self._spotify_service = spotify_service
            self._notifier = notifier

        async def execute(self, user_id: str, use_case: "StartGame") -> GameOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_game_master(game, user_id)
            self._assert_has_state(game, GameState.WAITING_FOR_PLAYERS)

            await self._game_repository.update_by_id(
                game.id, {"state": GameState.STARTED}
            )

            tracks = await self._spotify_service.get_random_tracks(
                game.settings.playlist_ids,
                count=len(game.players),
                market=game.settings.spotify_market,
            )
            player_tracks = {p.user_id: t for p, t in zip(game.players, tracks)}
            for player_user_id, track in player_tracks.items():
                await self._game_repository.insert_in_timeline(
                    game.id, player_user_id, track, 0
                )

            await self._notifier.notify(
                user_id,
                game,
                GameStarted(initial_tracks=player_tracks),
            )

            game = game.copy(
                update={
                    "state": GameState.STARTED,
                    "players": [
                        p.copy(update={"timeline": [player_tracks[p.user_id]]})
                        for p in game.players
                    ],
                }
            )

            return GameOut.from_model(game)


class AbortGame(BaseModel):
    game_id: str

    class Handler(BaseHandler):
        def __init__(
            self,
            game_repository: GameRepository,
            notifier: Notifier,
        ) -> None:
            super().__init__(game_repository)
            self._notifier = notifier

        async def execute(self, user_id: str, use_case: "AbortGame") -> None:
            game = await self._get_game(use_case.game_id)
            self._assert_is_game_master(game, user_id)
            self._assert_has_not_state(game, (GameState.ABORTED, GameState.COMPLETED))

            await self._game_repository.update_by_id(
                game.id, {"state": GameState.ABORTED}
            )

            await self._notifier.notify(user_id, game, GameAborted())


class CreateTurn(BaseModel):
    game_id: str

    class Handler(BaseHandler):
        def __init__(
            self,
            game_repository: GameRepository,
            spotify_service: SpotifyService,
            notifier: Notifier,
        ) -> None:
            super().__init__(game_repository)
            self._spotify_service = spotify_service
            self._notifier = notifier

        async def execute(self, user_id: str, use_case: "CreateTurn") -> TurnOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, (GameState.STARTED, GameState.SCORING))

            player_ids = [p.user_id for p in game.players]
            try:
                active_user_index = player_ids.index(game.turns[-1].active_user_id)
            except (IndexError, ValueError):
                active_user_index = -1
            next_player_id = player_ids[(active_user_index + 1) % len(player_ids)]

            timeline_track_ids = {
                t.spotify_id for p in game.players for t in p.timeline
            }
            played_track_ids = {t.track.spotify_id for t in game.turns}
            exclude_track_ids = timeline_track_ids.union(played_track_ids)
            track = await self._spotify_service.get_random_track(
                game.settings.playlist_ids,
                exclude=exclude_track_ids,
                market=game.settings.spotify_market,
            )

            turn = Turn(
                active_user_id=next_player_id,
                track=track,
            )
            await self._game_repository.add_turn(game.id, turn)
            await self._game_repository.update_by_id(
                game.id, {"state": GameState.GUESSING}
            )

            turn_out = TurnOut.from_model(turn)
            await self._notifier.notify(user_id, game, NewTurn(turn=turn_out))

            return turn_out


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
                NewGuess(user_id=user_id, guess=guess_out),
            )

            return guess_out


class ScoreTurn(BaseModel):
    game_id: str
    turn_id: int

    class Handler(BaseHandler):
        def __init__(
            self,
            game_repository: GameRepository,
            notifier: Notifier,
        ) -> None:
            super().__init__(game_repository)
            self._notifier = notifier

        async def execute(self, user_id: str, use_case: "ScoreTurn") -> TurnScoringOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, GameState.GUESSING)
            self._assert_is_active_turn(game, use_case.turn_id)

            turn = game.turns[use_case.turn_id]
            active_player = game.get_player(turn.active_user_id)
            if not active_player:
                raise UseCaseException(
                    code="INACTIVE_PLAYER",
                    description="Only the active player can perform this operation",
                    status_code=403,
                )

            tokens: Dict[str, int] = defaultdict(lambda: 0)
            sorted_guesses = dict(
                sorted(
                    turn.guesses.items(),
                    key=lambda kv: (kv[0] != turn.active_user_id, kv[1].timestamp),
                )
            )
            position_guessed = year_guessed = False
            for guess_user_id, guess in sorted_guesses.items():
                player = game.get_player(guess_user_id)
                if not player:
                    continue

                is_active_user = guess_user_id == turn.active_user_id
                if not is_active_user:
                    if not position_guessed and guess.position is not None:
                        tokens[guess_user_id] -= 1
                    if not year_guessed and guess.release_year is not None:
                        tokens[guess_user_id] -= 1

                position_correct, year_correct = self._check_guess(
                    active_player.timeline,
                    turn.track,
                    guess,
                )
                if position_correct and not position_guessed:
                    position_guessed = True
                    await self._game_repository.insert_in_timeline(
                        game.id, guess_user_id, turn.track, guess.position or 0
                    )
                if year_correct and not year_guessed:
                    year_guessed = True
                    tokens[guess_user_id] += 1 if is_active_user else 2

                if position_correct and year_guessed:
                    break

            await self._game_repository.inc_tokens(game.id, tokens)

            game_completed = self._check_end_condition(game)
            if game_completed:
                new_state = GameState.COMPLETED
            else:
                new_state = GameState.SCORING
            await self._game_repository.update_by_id(game.id, {"state": new_state})

            scoring_out = TurnScoringOut(tokens=tokens, game_completed=game_completed)
            await self._notifier.notify(
                user_id,
                game,
                TurnScored(scoring=scoring_out),
            )

            return scoring_out

        def _check_guess(
            self, timeline: List[Track], track: Track, guess: Guess
        ) -> Tuple[bool, bool]:
            position_correct: bool = False
            if guess.position is not None:
                if guess.position == 0:
                    min_year = 0
                else:
                    min_year = timeline[guess.position - 1].release_year
                if guess.position == len(timeline):
                    max_year = datetime.now().year
                else:
                    max_year = timeline[guess.position].release_year

                position_correct = min_year <= track.release_year <= max_year

            year_correct: bool = False
            if guess.release_year is not None:
                year_correct = guess.release_year == track.release_year

            return position_correct, year_correct

        def _check_end_condition(self, game: Game) -> bool:
            if not game.turns:
                return False

            user_id = game.turns[-1].active_user_id
            player = game.get_player(user_id)
            if not player:
                return False

            round_complete = list(game.players)[-1] == player
            target_length_reached = len(player.timeline) > TARGET_TIMELINE_LENGTH
            return round_complete and target_length_reached


class RegisterNotificationChannel(BaseModel):
    game_id: str
    channel: NotificationChannel

    class Config:
        arbitrary_types_allowed = True

    class Handler(BaseHandler):
        def __init__(self, game_repository: GameRepository, notifier: Notifier) -> None:
            super().__init__(game_repository)
            self._notifier = notifier

        async def execute(
            self, user_id: str, use_case: "RegisterNotificationChannel"
        ) -> None:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)

            self._notifier.add_channel(use_case.game_id, user_id, use_case.channel)


class UnregisterNotificationChannel(BaseModel):
    channel: NotificationChannel

    class Config:
        arbitrary_types_allowed = True

    class Handler(BaseHandler):
        def __init__(self, game_repository: GameRepository, notifier: Notifier) -> None:
            super().__init__(game_repository)
            self._notifier = notifier

        async def execute(self, use_case: "UnregisterNotificationChannel") -> None:
            self._notifier.remove_channel(use_case.channel)
