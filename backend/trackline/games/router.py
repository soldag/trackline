from typing import Annotated

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from fastapi_injector import Injected

from trackline.auth.deps import AuthUserId
from trackline.core.exceptions import RequestError
from trackline.core.fields import ResourceId
from trackline.core.schemas import EmptyResponse, EntityResponse
from trackline.core.use_cases import UseCaseExecutor
from trackline.core.utils.binding import Bind
from trackline.games.schemas import (
    CorrectionProposalOut,
    CorrectionProposalVoteResultOut,
    CreditsGuessOut,
    GameOut,
    ReleaseYearGuessOut,
    TrackExchangeOut,
    TrackPurchaseReceiptOut,
    TurnCompletionOut,
    TurnOut,
    TurnPassOut,
    TurnScoringOut,
)
from trackline.games.use_cases import (
    AbortGame,
    BuyTrack,
    CompleteTurn,
    CreateCreditsGuess,
    CreateGame,
    CreateReleaseYearGuess,
    CreateTurn,
    ExchangeTrack,
    GetGame,
    GetGames,
    GetGameUsers,
    JoinGame,
    LeaveGame,
    PassTurn,
    ProposeCorrection,
    RegisterNotificationChannel,
    ScoreTurn,
    StartGame,
    UnregisterNotificationChannel,
    VoteCorrection,
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
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[GameOut]:
    game = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=game)


@router.get("")
async def get_games(
    auth_user_id: AuthUserId,
    use_case: Annotated[GetGames, Bind(GetGames, query=["state"])],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[list[GameOut]]:
    users = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=users)


@router.get("/{game_id}")
async def get_game(
    auth_user_id: AuthUserId,
    use_case: Annotated[GetGame, Depends()],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[GameOut]:
    game = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=game)


@router.get("/{game_id}/users")
async def get_game_users(
    auth_user_id: AuthUserId,
    use_case: Annotated[GetGameUsers, Depends()],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[list[UserOut]]:
    users = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=users)


@router.put("/{game_id}/players", status_code=201)
async def join_game(
    auth_user_id: AuthUserId,
    use_case: Annotated[JoinGame, Depends()],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EmptyResponse:
    await use_case_executor.execute(use_case, auth_user_id)
    return EmptyResponse()


@router.delete("/{game_id}/players/{user_id}")
async def leave_game(
    user_id: ResourceId,
    auth_user_id: AuthUserId,
    use_case: Annotated[LeaveGame, Depends()],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EmptyResponse:
    if user_id != auth_user_id:
        raise RequestError(
            code="FORBIDDEN",
            message="You can only remove yourself from a game",
            status_code=403,
        )

    await use_case_executor.execute(use_case, auth_user_id)
    return EmptyResponse()


@router.post("/{game_id}/start")
async def start_game(
    auth_user_id: AuthUserId,
    use_case: Annotated[StartGame, Depends()],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[GameOut]:
    game = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=game)


@router.post("/{game_id}/abort")
async def abort_game(
    auth_user_id: AuthUserId,
    use_case: Annotated[AbortGame, Depends()],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EmptyResponse:
    await use_case_executor.execute(use_case, auth_user_id)
    return EmptyResponse()


@router.post("/{game_id}/turns")
async def create_turn(
    auth_user_id: AuthUserId,
    use_case: Annotated[CreateTurn, Depends()],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[TurnOut]:
    turn_out = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=turn_out)


@router.post("/{game_id}/turns/{turn_id}/guesses/release-year")
async def create_release_year_guess(
    auth_user_id: AuthUserId,
    use_case: Annotated[
        CreateReleaseYearGuess,
        Bind(CreateReleaseYearGuess, body=["turn_revision_id", "position", "year"]),
    ],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[ReleaseYearGuessOut]:
    guess_out = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=guess_out)


@router.post("/{game_id}/turns/{turn_id}/guesses/credits")
async def create_credits_guess(
    auth_user_id: AuthUserId,
    use_case: Annotated[
        CreateCreditsGuess,
        Bind(CreateCreditsGuess, body=["turn_revision_id", "artists", "title"]),
    ],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[CreditsGuessOut]:
    guess_out = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=guess_out)


@router.post("/{game_id}/turns/{turn_id}/pass")
async def pass_turn(
    auth_user_id: AuthUserId,
    use_case: Annotated[PassTurn, Depends()],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[TurnPassOut]:
    turn_pass_out = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=turn_pass_out)


@router.post("/{game_id}/turns/{turn_id}/score")
async def score_turn(
    auth_user_id: AuthUserId,
    use_case: Annotated[ScoreTurn, Depends()],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[TurnScoringOut]:
    turn_scoring_out = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=turn_scoring_out)


@router.post("/{game_id}/turns/{turn_id}/correction")
async def propose_correction(
    auth_user_id: AuthUserId,
    use_case: Annotated[
        ProposeCorrection,
        Bind(ProposeCorrection, body=["release_year"]),
    ],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[CorrectionProposalOut]:
    proposal_out = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=proposal_out)


@router.post("/{game_id}/turns/{turn_id}/correction/vote")
async def vote_correction(
    auth_user_id: AuthUserId,
    use_case: Annotated[VoteCorrection, Bind(VoteCorrection, body=["agree"])],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[CorrectionProposalVoteResultOut]:
    vote_out = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=vote_out)


@router.post("/{game_id}/turns/{turn_id}/complete")
async def complete_turn(
    auth_user_id: AuthUserId,
    use_case: Annotated[CompleteTurn, Depends()],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[TurnCompletionOut]:
    turn_completion_out = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=turn_completion_out)


@router.post("/{game_id}/players/{user_id}/timeline")
async def buy_track(
    user_id: ResourceId,
    auth_user_id: AuthUserId,
    use_case: Annotated[BuyTrack, Depends()],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[TrackPurchaseReceiptOut]:
    if user_id != auth_user_id:
        raise RequestError(
            code="FORBIDDEN",
            message="You can only buy tracks for yourself",
            status_code=403,
        )

    receipt_out = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=receipt_out)


@router.post("/{game_id}/turns/{turn_id}/track/exchange")
async def exchange_track(
    auth_user_id: AuthUserId,
    use_case: Annotated[ExchangeTrack, Depends()],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[TrackExchangeOut]:
    track_exchange_out = await use_case_executor.execute(use_case, auth_user_id)
    return EntityResponse(data=track_exchange_out)


@router.websocket("/{game_id}/notifications")
async def notifications(
    game_id: ResourceId,
    websocket: WebSocket,
    auth_user_id: AuthUserId,
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> None:
    register_use_case = RegisterNotificationChannel(game_id=game_id, channel=websocket)
    await use_case_executor.execute(register_use_case, auth_user_id)

    await websocket.accept()
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        unregister_use_case = UnregisterNotificationChannel(channel=websocket)
        await use_case_executor.execute(unregister_use_case, auth_user_id)
