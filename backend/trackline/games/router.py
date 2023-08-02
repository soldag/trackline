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
from trackline.core.exceptions import RequestException
from trackline.core.fields import ResourceId
from trackline.core.schemas import EntityResponse, Response
from trackline.games.schemas import (
    GameOut,
    GuessOut,
    TrackOut,
    TrackPurchaseReceiptOut,
    TurnCompletionOut,
    TurnOut,
    TurnScoringOut,
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


@router.post("", status_code=201)
async def create_game(
    auth_user_id: AuthUserId,
    use_case: CreateGame,
    handler: Annotated[CreateGame.Handler, Injected(CreateGame.Handler)],
) -> EntityResponse[GameOut]:
    game = await handler.execute(auth_user_id, use_case)
    return EntityResponse(data=game)


@router.get("/{game_id}")
async def get_game(
    auth_user_id: AuthUserId,
    use_case: Annotated[GetGame, Depends()],
    handler: Annotated[GetGame.Handler, Injected(GetGame.Handler)],
) -> EntityResponse[GameOut]:
    game = await handler.execute(auth_user_id, use_case)
    return EntityResponse(data=game)


@router.get("/{game_id}/users")
async def get_game_users(
    auth_user_id: AuthUserId,
    use_case: Annotated[GetGameUsers, Depends()],
    handler: Annotated[GetGameUsers.Handler, Injected(GetGameUsers.Handler)],
) -> EntityResponse[list[UserOut]]:
    users = await handler.execute(auth_user_id, use_case)
    return EntityResponse(data=users)


@router.put("/{game_id}/players", status_code=201)
async def join_game(
    auth_user_id: AuthUserId,
    use_case: Annotated[JoinGame, Depends()],
    handler: Annotated[JoinGame.Handler, Injected(JoinGame.Handler)],
):
    await handler.execute(auth_user_id, use_case)
    return Response()


@router.delete("/{game_id}/players/{user_id}")
async def leave_game(
    user_id: ResourceId,
    auth_user_id: AuthUserId,
    use_case: Annotated[LeaveGame, Depends()],
    handler: Annotated[LeaveGame.Handler, Injected(LeaveGame.Handler)],
) -> Response:
    if user_id != auth_user_id:
        raise RequestException(
            "FORBIDDEN", "You can only remove yourself from a game", 403
        )

    await handler.execute(auth_user_id, use_case)
    return Response()


@router.post("/{game_id}/start")
async def start_game(
    auth_user_id: AuthUserId,
    use_case: Annotated[StartGame, Depends()],
    handler: Annotated[StartGame.Handler, Injected(StartGame.Handler)],
) -> EntityResponse[GameOut]:
    game = await handler.execute(auth_user_id, use_case)
    return EntityResponse(data=game)


@router.post("/{game_id}/abort")
async def abort_game(
    auth_user_id: AuthUserId,
    use_case: Annotated[AbortGame, Depends()],
    handler: Annotated[AbortGame.Handler, Injected(AbortGame.Handler)],
) -> Response:
    await handler.execute(auth_user_id, use_case)
    return Response()


@router.post("/{game_id}/turns")
async def create_turn(
    auth_user_id: AuthUserId,
    use_case: Annotated[CreateTurn, Depends()],
    handler: Annotated[CreateTurn.Handler, Injected(CreateTurn.Handler)],
) -> EntityResponse[TurnOut]:
    turn_out = await handler.execute(auth_user_id, use_case)
    return EntityResponse(data=turn_out)


@dataclass
class CreateGuessParams:
    game_id: ResourceId = Path()
    turn_id: int = Path()
    position: int | None = Body(None)
    release_year: int | None = Body(None)

    def to_use_case(self) -> CreateGuess:
        return CreateGuess(**asdict(self))


@router.post("/{game_id}/turns/{turn_id}/guess")
async def create_guess(
    auth_user_id: AuthUserId,
    params: Annotated[CreateGuessParams, Depends()],
    handler: Annotated[CreateGuess.Handler, Injected(CreateGuess.Handler)],
) -> EntityResponse[GuessOut]:
    turn_out = await handler.execute(auth_user_id, params.to_use_case())
    return EntityResponse(data=turn_out)


@router.post("/{game_id}/turns/{turn_id}/score")
async def score_turn(
    auth_user_id: AuthUserId,
    use_case: Annotated[ScoreTurn, Depends()],
    handler: Annotated[ScoreTurn.Handler, Injected(ScoreTurn.Handler)],
) -> EntityResponse[TurnScoringOut]:
    turn_scoring_out = await handler.execute(auth_user_id, use_case)
    return EntityResponse(data=turn_scoring_out)


@router.post("/{game_id}/turns/{turn_id}/complete")
async def complete_turn(
    auth_user_id: AuthUserId,
    use_case: Annotated[CompleteTurn, Depends()],
    handler: Annotated[CompleteTurn.Handler, Injected(CompleteTurn.Handler)],
) -> EntityResponse[TurnCompletionOut]:
    turn_completion_out = await handler.execute(auth_user_id, use_case)
    return EntityResponse(data=turn_completion_out)


@router.post("/{game_id}/players/{user_id}/timeline")
async def buy_track(
    user_id: ResourceId,
    auth_user_id: AuthUserId,
    use_case: Annotated[BuyTrack, Depends()],
    handler: Annotated[BuyTrack.Handler, Injected(BuyTrack.Handler)],
) -> EntityResponse[TrackPurchaseReceiptOut]:
    if user_id != auth_user_id:
        raise RequestException("FORBIDDEN", "You can only buy tracks for yourself", 403)

    receipt_out = await handler.execute(auth_user_id, use_case)
    return EntityResponse(data=receipt_out)


@router.post("/{game_id}/turns/{turn_id}/track/exchange")
async def exchange_track(
    auth_user_id: AuthUserId,
    use_case: Annotated[ExchangeTrack, Depends()],
    handler: Annotated[ExchangeTrack.Handler, Injected(ExchangeTrack.Handler)],
) -> EntityResponse[TrackOut]:
    track_out = await handler.execute(auth_user_id, use_case)
    return EntityResponse(data=track_out)


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
