from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends

from trackline.ioc import Container
from trackline.schema.responses import EntityResponse
from trackline.schema.users import UserOut
from trackline.use_cases.users import CreateUser, GetCurrentUser
from trackline.utils.deps import get_auth_user
from trackline.utils.responses import make_ok


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("", response_model=EntityResponse[UserOut], status_code=201)
@inject
async def create_user(
    use_case: CreateUser,
    handler: CreateUser.Handler = Depends(Provide[Container.create_user_handler]),
):
    user = await handler.execute(use_case)
    return make_ok(user)


@router.get("/me", response_model=EntityResponse[UserOut])
@inject
async def get_current_user(
    auth_user_id: str = Depends(get_auth_user),
    handler: GetCurrentUser.Handler = Depends(
        Provide[Container.get_current_user_handler]
    ),
):
    use_case = GetCurrentUser()
    user = await handler.execute(auth_user_id, use_case)
    return make_ok(user)
