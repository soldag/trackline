from typing import Annotated

from fastapi import APIRouter
from fastapi_injector import Injected

from trackline.auth.deps import AuthUserId
from trackline.core.schemas import EntityResponse
from trackline.core.utils.response import make_ok
from trackline.users.schemas import UserOut
from trackline.users.use_cases import CreateUser, GetCurrentUser

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("", response_model=EntityResponse[UserOut], status_code=201)
async def create_user(
    use_case: CreateUser,
    handler: Annotated[CreateUser.Handler, Injected(CreateUser.Handler)],
):
    user = await handler.execute(use_case)
    return make_ok(user)


@router.get("/me", response_model=EntityResponse[UserOut])
async def get_current_user(
    auth_user_id: AuthUserId,
    use_case: Annotated[GetCurrentUser, Injected(GetCurrentUser)],
    handler: Annotated[GetCurrentUser.Handler, Injected(GetCurrentUser.Handler)],
):
    user = await handler.execute(auth_user_id, use_case)
    return make_ok(user)
