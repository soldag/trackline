from dependency_injector import containers, providers

from trackline.auth.ioc import AuthContainer
from trackline.configuration import DB_NAME, DB_URI
from trackline.core.db.client import DatabaseClient
from trackline.games.ioc import GamesContainer
from trackline.spotify.ioc import SpotifyContainer
from trackline.users.ioc import UsersContainer


class CoreContainer(containers.DeclarativeContainer):
    database_client = providers.ContextLocalSingleton(
        DatabaseClient,
        db_uri=DB_URI,
        db_name=DB_NAME,
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

    spotify = providers.Container(SpotifyContainer)

    games = providers.Container(
        GamesContainer,
        core=core,
        spotify=spotify,
        users=users,
    )
