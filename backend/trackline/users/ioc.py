from dependency_injector import containers, providers

from trackline.users.repository import UserRepository
from trackline.users.use_cases import CreateUser, GetCurrentUser


class UsersContainer(containers.DeclarativeContainer):
    core = providers.DependenciesContainer()

    user_repository = providers.Factory(
        UserRepository,
        db=core.database_client,
    )

    create_user_handler = providers.Factory(
        CreateUser.Handler,
        user_repository=user_repository,
    )

    get_current_user_handler = providers.Factory(
        GetCurrentUser.Handler,
        user_repository=user_repository,
    )
