from injector import inject

from trackline.auth.models import Session
from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseError
from trackline.core.use_cases import AnonymousUseCase, AnonymousUseCaseHandler


class DeleteSession(AnonymousUseCase):
    token: str


@DeleteSession.register_handler
class Handler(AnonymousUseCaseHandler[DeleteSession]):
    @inject
    def __init__(self, repository: Repository) -> None:
        self._repository = repository

    async def execute(self, use_case: DeleteSession) -> None:
        result = await self._repository.delete_many(
            Session,
            {"token": use_case.token},
        )
        if not result or result.deleted_count == 0:
            raise UseCaseError("INVALID_TOKEN", "The session token is invalid.")
