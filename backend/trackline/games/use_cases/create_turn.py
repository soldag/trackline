from math import floor

from injector import inject

from trackline.core.db.repository import Repository
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase
from trackline.games.constants import TOKEN_COST_BUY_TRACK
from trackline.games.models import Game, Player, Turn
from trackline.games.schemas import GameState, NewTurn, TurnOut
from trackline.games.services.game_notifier import GameNotifier
from trackline.games.services.track_provider import TrackProvider
from trackline.games.use_cases.base import TrackProvidingBaseHandler

CATCH_UP_FACTOR = 0.15
CATCH_UP_MAX_TOKENS = 2


class CreateTurn(AuthenticatedUseCase[TurnOut]):
    game_id: ResourceId


@CreateTurn.register_handler
class Handler(TrackProvidingBaseHandler[CreateTurn, TurnOut]):
    @inject
    def __init__(
        self,
        repository: Repository,
        track_provider: TrackProvider,
        notifier: GameNotifier,
    ) -> None:
        super().__init__(repository, track_provider)
        self._notifier = notifier

    async def execute(self, user_id: ResourceId, use_case: CreateTurn) -> TurnOut:
        game = await self._get_game(use_case.game_id)
        self._assert_is_player(game, user_id)
        self._assert_has_state(game, (GameState.STARTED, GameState.SCORING))

        # Apply catch up mechanism at the beginning of a new round, if enabled
        catch_up_token_gain: dict[ResourceId, int] = {}
        is_new_round = len(game.turns) % len(game.players) == 0
        if is_new_round and game.settings.enable_catchup:
            catch_up_token_gain = self._handle_catch_up(game)

        track = await self._get_new_track(game)
        next_player = game.get_next_player()
        turn = Turn(
            active_user_id=next_player.user_id,
            track=track,
            catch_up_token_gain=catch_up_token_gain,
        )

        game.state = GameState.GUESSING
        game.turns.append(turn)

        turn_out = TurnOut.from_model(turn)
        await self._notifier.notify(user_id, game, NewTurn(turn=turn_out))

        return turn_out

    def _handle_catch_up(self, game: Game) -> dict[ResourceId, int]:
        player_scores = [self._get_catch_up_score(p) for p in game.players]
        max_score = max(player_scores)

        token_gain: dict[ResourceId, int] = {}
        for player, score in zip(game.players, player_scores, strict=True):
            max_bonus = min(
                game.settings.max_tokens - player.tokens,
                CATCH_UP_MAX_TOKENS,
            )
            gap = max_score - score
            if bonus := min(floor(gap * CATCH_UP_FACTOR), max_bonus):
                player.tokens += bonus
                token_gain[player.user_id] = bonus

        return token_gain

    def _get_catch_up_score(self, player: Player) -> int:
        return len(player.timeline) * TOKEN_COST_BUY_TRACK + player.tokens
