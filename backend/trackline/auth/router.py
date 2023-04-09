from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends

from trackline.auth.deps import (
    get_auth_token,
    get_auth_user,
)
from trackline.auth.schemas import SessionOut
from trackline.auth.use_cases import CreateSession, DeleteSession
from trackline.core.fields import ResourceId
from trackline.core.ioc import AppContainer
from trackline.core.schemas import EntityResponse, Response
from trackline.core.utils.response import make_ok


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/login", response_model=EntityResponse[SessionOut], status_code=201)
@inject
async def login(
    use_case: CreateSession,
    handler: CreateSession.Handler = Depends(
        Provide[AppContainer.auth.create_session_handler]
    ),
):
    session = await handler.execute(use_case)
    return make_ok(session)


@router.post("/logout", response_model=Response)
@inject
async def logout(
    token: str = Depends(get_auth_token),
    auth_user_id: ResourceId = Depends(get_auth_user),
    handler: DeleteSession.Handler = Depends(
        Provide[AppContainer.auth.delete_session_handler]
    ),
):
    use_case = DeleteSession(token=token)
    await handler.execute(use_case)
    return make_ok()
