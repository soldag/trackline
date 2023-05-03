import os

from dependency_injector import containers, providers

from trackline.auth.ioc import AuthContainer
from trackline.core.db.client import DatabaseClient
from trackline.core.settings import Settings
from trackline.games.ioc import GamesContainer
from trackline.spotify.ioc import SpotifyContainer
from trackline.users.ioc import UsersContainer


ENVIRONMENT = os.getenv("ENVIRONMENT", "production").lower()


class CoreContainer(containers.DeclarativeContainer):
    settings = providers.Singleton(
        Settings,
        _env_file=(".env", f".env.{ENVIRONMENT}"),
    )

    database_client = providers.ContextLocalSingleton(
        DatabaseClient,
        settings=settings,
    )


class AppContainer(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(packages=["trackline"])

    core = providers.Container(
        CoreContainer,
    )

    users = providers.Container(
        UsersContainer,
        core=core,
    )

    auth = providers.Container(
        AuthContainer,
        core=core,
        users=users,
    )

    spotify = providers.Container(
        SpotifyContainer,
        core=core,
    )

    games = providers.Container(
        GamesContainer,
        core=core,
        spotify=spotify,
        users=users,
    )
