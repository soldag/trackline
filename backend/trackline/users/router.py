from dependency_injector.wiring import inject, Provide
from fastapi import APIRouter, Depends


from trackline.auth.deps import AuthUserDep
from trackline.core.ioc import AppContainer
from trackline.core.schemas import EntityResponse
from trackline.core.utils.response import make_ok
from trackline.users.schemas import UserOut
from trackline.users.use_cases import CreateUser, GetCurrentUser

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("", response_model=EntityResponse[UserOut], status_code=201)
@inject
async def create_user(
    use_case: CreateUser,
    handler: CreateUser.Handler = Depends(
        Provide[AppContainer.users.create_user_handler]
    ),
):
    user = await handler.execute(use_case)
    return make_ok(user)


@router.get("/me", response_model=EntityResponse[UserOut])
@inject
async def get_current_user(
    auth_user_id: AuthUserDep,
    use_case: GetCurrentUser = Depends(),
    handler: GetCurrentUser.Handler = Depends(
        Provide[AppContainer.users.get_current_user_handler]
    ),
):
    user = await handler.execute(auth_user_id, use_case)
    return make_ok(user)
