from dependency_injector import containers, providers

from trackline.configuration import (
    DB_NAME,
    DB_URI,
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URL,
)
from trackline.services.database import DatabaseClient
from trackline.services.notifier import Notifier
from trackline.services.repositories import (
    GameRepository,
    SessionRepository,
    UserRepository,
)
from trackline.services.spotify import SpotifyService
from trackline.use_cases.auth import (
    CreateSession,
    DeleteSession,
    GetSessionUser,
)
from trackline.use_cases.games import (
    AbortGame,
    CreateGame,
    CreateGuess,
    CreateTurn,
    ExchangeTrack,
    GetGame,
    GetGameUsers,
    JoinGame,
    LeaveGame,
    RegisterNotificationChannel,
    ScoreTurn,
    StartGame,
    UnregisterNotificationChannel,
)
from trackline.use_cases.spotify import GetSpotifyAccessToken, RefreshSpotifyAccessToken
from trackline.use_cases.users import CreateUser, GetCurrentUser


async def init_spotify_service(*args, **kwargs):
    service = SpotifyService(*args, **kwargs)
    await service.initialize()
    try:
        yield service
    finally:
        await service.close()


class Container(containers.DeclarativeContainer):
    config = providers.Configuration()
    wiring_config = containers.WiringConfiguration(
        modules=[
            ".middleware",
            ".routers.auth",
            ".routers.games",
            ".routers.spotify",
            ".routers.users",
        ]
    )

    # Services

    database = providers.ContextLocalSingleton(
        DatabaseClient,
        db_uri=DB_URI,
        db_name=DB_NAME,
    )

    game_repository = providers.Factory(
        GameRepository,
        database=database,
    )

    session_repository = providers.Factory(
        SessionRepository,
        database=database,
    )

    user_repository = providers.Factory(
        UserRepository,
        database=database,
    )

    notifier = providers.Singleton(Notifier)

    spotify_service = providers.Resource(
        init_spotify_service,
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET,
        redirect_url=SPOTIFY_REDIRECT_URL,
    )

    # Auth use case handlers

    create_session_handler = providers.Factory(
        CreateSession.Handler,
        session_repository=session_repository,
        user_repository=user_repository,
    )

    delete_session_handler = providers.Factory(
        DeleteSession.Handler,
        session_repository=session_repository,
    )

    get_session_handler = providers.Factory(
        GetSessionUser.Handler,
        session_repository=session_repository,
    )

    # Game use case handlers

    abort_game_handler = providers.Factory(
        AbortGame.Handler,
        game_repository=game_repository,
        notifier=notifier,
    )

    create_game_handler = providers.Factory(
        CreateGame.Handler,
        game_repository=game_repository,
    )

    create_guess_handler = providers.Factory(
        CreateGuess.Handler,
        game_repository=game_repository,
        notifier=notifier,
    )

    create_turn_handler = providers.Factory(
        CreateTurn.Handler,
        game_repository=game_repository,
        spotify_service=spotify_service,
        notifier=notifier,
    )

    exchange_track_handler = providers.Factory(
        ExchangeTrack.Handler,
        game_repository=game_repository,
        spotify_service=spotify_service,
        notifier=notifier,
    )

    get_game_handler = providers.Factory(
        GetGame.Handler,
        game_repository=game_repository,
    )

    get_game__users_handler = providers.Factory(
        GetGameUsers.Handler,
        game_repository=game_repository,
        user_repository=user_repository,
    )

    join_game_handler = providers.Factory(
        JoinGame.Handler,
        game_repository=game_repository,
        user_repository=user_repository,
        notifier=notifier,
    )

    leave_game_handler = providers.Factory(
        LeaveGame.Handler,
        game_repository=game_repository,
        notifier=notifier,
    )

    register_notification_channel_handler = providers.Factory(
        RegisterNotificationChannel.Handler,
        game_repository=game_repository,
        notifier=notifier,
    )

    score_turn_handler = providers.Factory(
        ScoreTurn.Handler,
        game_repository=game_repository,
        notifier=notifier,
    )

    start_game_handler = providers.Factory(
        StartGame.Handler,
        game_repository=game_repository,
        spotify_service=spotify_service,
        notifier=notifier,
    )

    unregister_notification_channel_handler = providers.Factory(
        UnregisterNotificationChannel.Handler,
        game_repository=game_repository,
        notifier=notifier,
    )

    # Spotify use cases

    get_spotify_access_token_handler = providers.Factory(
        GetSpotifyAccessToken.Handler,
        spotify_service=spotify_service,
    )

    refresh_spotify_access_token_handler = providers.Factory(
        RefreshSpotifyAccessToken.Handler,
        spotify_service=spotify_service,
    )

    # User use cases

    create_user_handler = providers.Factory(
        CreateUser.Handler,
        user_repository=user_repository,
    )

    get_current_user_handler = providers.Factory(
        GetCurrentUser.Handler,
        user_repository=user_repository,
    )
