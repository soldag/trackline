from dependency_injector import containers, providers

from trackline.auth.repository import SessionRepository
from trackline.auth.use_cases import (
    CreateSession,
    DeleteSession,
    GetSessionUser,
)


class AuthContainer(containers.DeclarativeContainer):
    core = providers.DependenciesContainer()
    users = providers.DependenciesContainer()

    session_repository = providers.Factory(
        SessionRepository,
        db=core.database_client,
    )

    create_session_handler = providers.Factory(
        CreateSession.Handler,
        session_repository=session_repository,
        user_repository=users.user_repository,
    )

    delete_session_handler = providers.Factory(
        DeleteSession.Handler,
        session_repository=session_repository,
    )

    get_session_handler = providers.Factory(
        GetSessionUser.Handler,
        session_repository=session_repository,
    )
