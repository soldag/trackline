from typing import Annotated

from fastapi import APIRouter
from fastapi_injector import Injected

from trackline.auth.deps import AuthUserId
from trackline.core.schemas import EntityResponse
from trackline.core.use_cases import UseCaseExecutor
from trackline.users.schemas import UserOut
from trackline.users.use_cases import CreateUser, GetCurrentUser

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("", status_code=201)
async def create_user(
    use_case: CreateUser,
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[UserOut]:
    user = await use_case_executor.execute(use_case)
    return EntityResponse(data=user)


@router.get("/me")
async def get_current_user(
    auth_user_id: AuthUserId,
    use_case: Annotated[GetCurrentUser, Injected(GetCurrentUser)],
    use_case_executor: Annotated[UseCaseExecutor, Injected(UseCaseExecutor)],
) -> EntityResponse[UserOut]:
    user = await use_case_executor.execute(use_case, user_id=auth_user_id)
    return EntityResponse(data=user)
