from dataclasses import asdict, dataclass

from dependency_injector.wiring import inject, Provide
from fastapi import (
    APIRouter,
    Body,
    Depends,
    Path,
    WebSocket,
    WebSocketDisconnect,
)

from trackline.auth.deps import get_auth_user
from trackline.core.fields import ResourceId
from trackline.core.ioc import AppContainer
from trackline.core.schemas import EntityResponse, Response
from trackline.core.utils.response import make_error, make_ok
from trackline.games.schemas import (
    GameOut,
    GuessOut,
    TrackOut,
    TrackPurchaseReceiptOut,
    TurnCompletionOut,
    TurnOut,
)
from trackline.games.use_cases import (
    AbortGame,
    BuyTrack,
    CompleteTurn,
    CreateGame,
    CreateGuess,
    CreateTurn,
    ExchangeTrack,
    GetGame,
    GetGameUsers,
    JoinGame,
    LeaveGame,
    RegisterNotificationChannel,
    ScoreTurn,
    StartGame,
    UnregisterNotificationChannel,
)
from trackline.users.schemas import UserOut


router = APIRouter(
    prefix="/games",
    tags=["Games"],
)


@router.post("", response_model=EntityResponse[GameOut], status_code=201)
@inject
async def create_game(
    use_case: CreateGame,
    auth_user_id: ResourceId = Depends(get_auth_user),
    handler: CreateGame.Handler = Depends(
        Provide[AppContainer.games.create_game_handler]
    ),
):
    game = await handler.execute(auth_user_id, use_case)
    return make_ok(game)


@router.get("/{game_id}", response_model=EntityResponse[GameOut])
@inject
async def get_game(
    auth_user_id: ResourceId = Depends(get_auth_user),
    use_case: GetGame = Depends(),
    handler: GetGame.Handler = Depends(Provide[AppContainer.games.get_game_handler]),
):
    game = await handler.execute(auth_user_id, use_case)
    return make_ok(game)


@router.get("/{game_id}/users", response_model=EntityResponse[list[UserOut]])
@inject
async def get_game_users(
    auth_user_id: ResourceId = Depends(get_auth_user),
    use_case: GetGameUsers = Depends(),
    handler: GetGameUsers.Handler = Depends(
        Provide[AppContainer.games.get_game_users_handler]
    ),
):
    users = await handler.execute(auth_user_id, use_case)
    return make_ok(users)


@router.put("/{game_id}/players", response_model=Response, status_code=201)
@inject
async def join_game(
    auth_user_id: ResourceId = Depends(get_auth_user),
    use_case: JoinGame = Depends(),
    handler: JoinGame.Handler = Depends(Provide[AppContainer.games.join_game_handler]),
):
    await handler.execute(auth_user_id, use_case)
    return make_ok()


@router.delete("/{game_id}/players/{user_id}", response_model=Response)
@inject
async def leave_game(
    user_id: ResourceId,
    auth_user_id: ResourceId = Depends(get_auth_user),
    use_case: LeaveGame = Depends(),
    handler: LeaveGame.Handler = Depends(
        Provide[AppContainer.games.leave_game_handler]
    ),
):
    if user_id != auth_user_id:
        return make_error("FORBIDDEN", "You can only remove yourself from a game", 403)

    await handler.execute(auth_user_id, use_case)
    return make_ok()


@router.post("/{game_id}/start", response_model=EntityResponse[GameOut])
@inject
async def start_game(
    auth_user_id: ResourceId = Depends(get_auth_user),
    use_case: StartGame = Depends(),
    handler: StartGame.Handler = Depends(
        Provide[AppContainer.games.start_game_handler]
    ),
):
    game = await handler.execute(auth_user_id, use_case)
    return make_ok(game)


@router.post("/{game_id}/abort", response_model=Response)
@inject
async def abort_game(
    auth_user_id: ResourceId = Depends(get_auth_user),
    use_case: AbortGame = Depends(),
    handler: AbortGame.Handler = Depends(
        Provide[AppContainer.games.abort_game_handler]
    ),
):
    await handler.execute(auth_user_id, use_case)
    return make_ok()


@router.post("/{game_id}/turns", response_model=EntityResponse[TurnOut])
@inject
async def create_turn(
    auth_user_id: ResourceId = Depends(get_auth_user),
    use_case: CreateTurn = Depends(),
    handler: CreateTurn.Handler = Depends(
        Provide[AppContainer.games.create_turn_handler]
    ),
):
    turn_out = await handler.execute(auth_user_id, use_case)
    return make_ok(turn_out)


@dataclass
class CreateGuessParams:
    game_id: ResourceId = Path()
    turn_id: int = Path()
    position: int | None = Body(None)
    release_year: int | None = Body(None)

    def to_use_case(self) -> CreateGuess:
        return CreateGuess(**asdict(self))


@router.post(
    "/{game_id}/turns/{turn_id}/guess", response_model=EntityResponse[GuessOut]
)
@inject
async def create_guess(
    auth_user_id: ResourceId = Depends(get_auth_user),
    params: CreateGuessParams = Depends(),
    handler: CreateGuess.Handler = Depends(
        Provide[AppContainer.games.create_guess_handler]
    ),
):
    turn_out = await handler.execute(auth_user_id, params.to_use_case())
    return make_ok(turn_out)


@router.post("/{game_id}/turns/{turn_id}/score", response_model=EntityResponse[GameOut])
@inject
async def score_turn(
    auth_user_id: ResourceId = Depends(get_auth_user),
    use_case: ScoreTurn = Depends(),
    handler: ScoreTurn.Handler = Depends(
        Provide[AppContainer.games.score_turn_handler]
    ),
):
    turn_out = await handler.execute(auth_user_id, use_case)
    return make_ok(turn_out)


@router.post(
    "/{game_id}/turns/{turn_id}/complete",
    response_model=EntityResponse[TurnCompletionOut],
)
@inject
async def complete_turn(
    auth_user_id: ResourceId = Depends(get_auth_user),
    use_case: CompleteTurn = Depends(),
    handler: CompleteTurn.Handler = Depends(
        Provide[AppContainer.games.complete_turn_handler]
    ),
):
    turn_out = await handler.execute(auth_user_id, use_case)
    return make_ok(turn_out)


@router.post(
    "/{game_id}/players/{user_id}/timeline",
    response_model=EntityResponse[TrackPurchaseReceiptOut],
)
@inject
async def buy_track(
    user_id: ResourceId,
    auth_user_id: ResourceId = Depends(get_auth_user),
    use_case: BuyTrack = Depends(),
    handler: BuyTrack.Handler = Depends(Provide[AppContainer.games.buy_track_handler]),
):
    if user_id != auth_user_id:
        return make_error("FORBIDDEN", "You can only buy tracks for yourself", 403)

    receipt_out = await handler.execute(auth_user_id, use_case)
    return make_ok(receipt_out)


@router.post(
    "/{game_id}/turns/{turn_id}/track/exchange", response_model=EntityResponse[TrackOut]
)
@inject
async def exchange_track(
    auth_user_id: ResourceId = Depends(get_auth_user),
    use_case: ExchangeTrack = Depends(),
    handler: ExchangeTrack.Handler = Depends(
        Provide[AppContainer.games.exchange_track_handler]
    ),
):
    track_out = await handler.execute(auth_user_id, use_case)
    return make_ok(track_out)


@router.websocket("/{game_id}/notifications")
@inject
async def notifications(
    game_id: ResourceId,
    websocket: WebSocket,
    auth_user_id: ResourceId = Depends(get_auth_user),
    register_handler: RegisterNotificationChannel.Handler = Depends(
        Provide[AppContainer.games.register_notification_channel_handler]
    ),
    unregister_handler: UnregisterNotificationChannel.Handler = Depends(
        Provide[AppContainer.games.unregister_notification_channel_handler]
    ),
):
    register_use_case = RegisterNotificationChannel(game_id=game_id, channel=websocket)
    await register_handler.execute(auth_user_id, register_use_case)

    await websocket.accept()
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        unregister_use_case = UnregisterNotificationChannel(channel=websocket)
        await unregister_handler.execute(unregister_use_case)
