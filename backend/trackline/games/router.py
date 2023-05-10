from dataclasses import asdict, dataclass
from typing import Annotated

from fastapi import (
    APIRouter,
    Body,
    Depends,
    Path,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi_injector import Injected

from trackline.auth.deps import AuthUserId
from trackline.core.fields import ResourceId
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
async def create_game(
    auth_user_id: AuthUserId,
    use_case: CreateGame,
    handler: Annotated[CreateGame.Handler, Injected(CreateGame.Handler)],
):
    game = await handler.execute(auth_user_id, use_case)
    return make_ok(game)


@router.get("/{game_id}", response_model=EntityResponse[GameOut])
async def get_game(
    auth_user_id: AuthUserId,
    use_case: Annotated[GetGame, Depends()],
    handler: Annotated[GetGame.Handler, Injected(GetGame.Handler)],
):
    game = await handler.execute(auth_user_id, use_case)
    return make_ok(game)


@router.get("/{game_id}/users", response_model=EntityResponse[list[UserOut]])
async def get_game_users(
    auth_user_id: AuthUserId,
    use_case: Annotated[GetGameUsers, Depends()],
    handler: Annotated[GetGameUsers.Handler, Injected(GetGameUsers.Handler)],
):
    users = await handler.execute(auth_user_id, use_case)
    return make_ok(users)


@router.put("/{game_id}/players", response_model=Response, status_code=201)
async def join_game(
    auth_user_id: AuthUserId,
    use_case: Annotated[JoinGame, Depends()],
    handler: Annotated[JoinGame.Handler, Injected(JoinGame.Handler)],
):
    await handler.execute(auth_user_id, use_case)
    return make_ok()


@router.delete("/{game_id}/players/{user_id}", response_model=Response)
async def leave_game(
    user_id: ResourceId,
    auth_user_id: AuthUserId,
    use_case: Annotated[LeaveGame, Depends()],
    handler: Annotated[LeaveGame.Handler, Injected(LeaveGame.Handler)],
):
    if user_id != auth_user_id:
        return make_error("FORBIDDEN", "You can only remove yourself from a game", 403)

    await handler.execute(auth_user_id, use_case)
    return make_ok()


@router.post("/{game_id}/start", response_model=EntityResponse[GameOut])
async def start_game(
    auth_user_id: AuthUserId,
    use_case: Annotated[StartGame, Depends()],
    handler: Annotated[StartGame.Handler, Injected(StartGame.Handler)],
):
    game = await handler.execute(auth_user_id, use_case)
    return make_ok(game)


@router.post("/{game_id}/abort", response_model=Response)
async def abort_game(
    auth_user_id: AuthUserId,
    use_case: Annotated[AbortGame, Depends()],
    handler: Annotated[AbortGame.Handler, Injected(AbortGame.Handler)],
):
    await handler.execute(auth_user_id, use_case)
    return make_ok()


@router.post("/{game_id}/turns", response_model=EntityResponse[TurnOut])
async def create_turn(
    auth_user_id: AuthUserId,
    use_case: Annotated[CreateTurn, Depends()],
    handler: Annotated[CreateTurn.Handler, Injected(CreateTurn.Handler)],
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
async def create_guess(
    auth_user_id: AuthUserId,
    params: Annotated[CreateGuessParams, Depends()],
    handler: Annotated[CreateGuess.Handler, Injected(CreateGuess.Handler)],
):
    turn_out = await handler.execute(auth_user_id, params.to_use_case())
    return make_ok(turn_out)


@router.post("/{game_id}/turns/{turn_id}/score", response_model=EntityResponse[GameOut])
async def score_turn(
    auth_user_id: AuthUserId,
    use_case: Annotated[ScoreTurn, Depends()],
    handler: Annotated[ScoreTurn.Handler, Injected(ScoreTurn.Handler)],
):
    turn_out = await handler.execute(auth_user_id, use_case)
    return make_ok(turn_out)


@router.post(
    "/{game_id}/turns/{turn_id}/complete",
    response_model=EntityResponse[TurnCompletionOut],
)
async def complete_turn(
    auth_user_id: AuthUserId,
    use_case: Annotated[CompleteTurn, Depends()],
    handler: Annotated[CompleteTurn.Handler, Injected(CompleteTurn.Handler)],
):
    turn_out = await handler.execute(auth_user_id, use_case)
    return make_ok(turn_out)


@router.post(
    "/{game_id}/players/{user_id}/timeline",
    response_model=EntityResponse[TrackPurchaseReceiptOut],
)
async def buy_track(
    user_id: ResourceId,
    auth_user_id: AuthUserId,
    use_case: Annotated[BuyTrack, Depends()],
    handler: Annotated[BuyTrack.Handler, Injected(BuyTrack.Handler)],
):
    if user_id != auth_user_id:
        return make_error("FORBIDDEN", "You can only buy tracks for yourself", 403)

    receipt_out = await handler.execute(auth_user_id, use_case)
    return make_ok(receipt_out)


@router.post(
    "/{game_id}/turns/{turn_id}/track/exchange", response_model=EntityResponse[TrackOut]
)
async def exchange_track(
    auth_user_id: AuthUserId,
    use_case: Annotated[ExchangeTrack, Depends()],
    handler: Annotated[ExchangeTrack.Handler, Injected(ExchangeTrack.Handler)],
):
    track_out = await handler.execute(auth_user_id, use_case)
    return make_ok(track_out)


@router.websocket("/{game_id}/notifications")
async def notifications(
    game_id: ResourceId,
    websocket: WebSocket,
    auth_user_id: AuthUserId,
    register_handler: Annotated[
        RegisterNotificationChannel.Handler,
        Injected(RegisterNotificationChannel.Handler),
    ],
    unregister_handler: Annotated[
        UnregisterNotificationChannel.Handler,
        Injected(UnregisterNotificationChannel.Handler),
    ],
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
