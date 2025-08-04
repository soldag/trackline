from typing import Annotated

from fastapi import APIRouter
from fastapi_injector import Injected

from trackline.auth.deps import AuthToken, AuthUserId
from trackline.auth.schemas import SessionOut
from trackline.auth.use_cases import CreateSession, DeleteSession
from trackline.core.schemas import EmptyResponse, EntityResponse
from trackline.core.use_cases import UseCaseExecutor

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/login", status_code=201)
async def login(
    use_case: CreateSession,
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[SessionOut]:
    session = await use_case_executor.execute(use_case)
    return EntityResponse(data=session)


@router.post("/logout")
async def logout(
    token: AuthToken,
    auth_user_id: AuthUserId,
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EmptyResponse:
    use_case = DeleteSession(token=token)
    await use_case_executor.execute(use_case)
    return EmptyResponse()
