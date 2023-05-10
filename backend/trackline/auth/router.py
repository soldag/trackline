from typing import Annotated

from fastapi import APIRouter
from fastapi_injector import Injected

from trackline.auth.deps import AuthToken, AuthUserId
from trackline.auth.schemas import SessionOut
from trackline.auth.use_cases import CreateSession, DeleteSession
from trackline.core.schemas import EntityResponse, Response
from trackline.core.utils.response import make_ok


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/login", response_model=EntityResponse[SessionOut], status_code=201)
async def login(
    use_case: CreateSession,
    handler: Annotated[CreateSession.Handler, Injected(CreateSession.Handler)],
):
    session = await handler.execute(use_case)
    return make_ok(session)


@router.post("/logout", response_model=Response)
async def logout(
    token: AuthToken,
    auth_user_id: AuthUserId,
    handler: Annotated[DeleteSession.Handler, Injected(DeleteSession.Handler)],
):
    use_case = DeleteSession(token=token)
    await handler.execute(use_case)
    return make_ok()
