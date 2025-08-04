from injector import inject

from trackline.auth.models import Session
from trackline.core.db.repository import Repository
from trackline.core.fields import ResourceId
from trackline.core.use_cases import AnonymousUseCase, AnonymousUseCaseHandler


class GetSessionUser(AnonymousUseCase[ResourceId | None]):
    token: str


@GetSessionUser.register_handler
class Handler(AnonymousUseCaseHandler[GetSessionUser, ResourceId | None]):
    @inject
    def __init__(self, repository: Repository) -> None:
        self._repository = repository

    async def execute(self, use_case: GetSessionUser) -> ResourceId | None:
        session = await self._repository.get_one(Session, {"token": use_case.token})
        return session.user_id if session else None
