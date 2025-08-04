from injector import inject

from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseError
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AuthenticatedUseCase, AuthenticatedUseCaseHandler
from trackline.users.models import User
from trackline.users.schemas import UserOut


class GetCurrentUser(AuthenticatedUseCase[UserOut]):
    pass


@GetCurrentUser.register_handler
class Handler(AuthenticatedUseCaseHandler[GetCurrentUser, UserOut]):
    @inject
    def __init__(self, repository: Repository) -> None:
        self._repository = repository

    async def execute(self, user_id: ResourceId, use_case: GetCurrentUser) -> UserOut:
        user = await self._repository.get(User, user_id)
        if not user:
            raise UseCaseError(
                code="USER_NOT_FOUND",
                message="The user does not exist.",
                status_code=404,
            )

        return UserOut.from_model(user)
