from typing import Annotated

from fastapi import APIRouter
from fastapi_injector import Injected

from trackline.auth.deps import AuthToken, AuthUserId
from trackline.auth.schemas import SessionOut
from trackline.auth.use_cases import CreateSession, DeleteSession
from trackline.core.schemas import EntityResponse, Response

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/login", status_code=201)
async def login(
    use_case: CreateSession,
    handler: Annotated[CreateSession.Handler, Injected(CreateSession.Handler)],
) -> EntityResponse[SessionOut]:
    session = await handler.execute(use_case)
    return EntityResponse(data=session)


@router.post("/logout")
async def logout(
    token: AuthToken,
    auth_user_id: AuthUserId,
    handler: Annotated[DeleteSession.Handler, Injected(DeleteSession.Handler)],
) -> Response:
    use_case = DeleteSession(token=token)
    await handler.execute(use_case)
    return Response()
