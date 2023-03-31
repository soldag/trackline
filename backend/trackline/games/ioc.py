from dependency_injector import containers, providers

from trackline.games.music_brainz import MusicBrainzClient
from trackline.games.notifier import Notifier
from trackline.games.repository import GameRepository
from trackline.games.track_provider import TrackProvider
from trackline.games.use_cases import (
    AbortGame,
    BuyTrack,
    CompleteTurn,
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


class GamesContainer(containers.DeclarativeContainer):
    core = providers.DependenciesContainer()
    spotify = providers.DependenciesContainer()
    users = providers.DependenciesContainer()

    notifier = providers.Singleton(Notifier)

    game_repository = providers.Factory(
        GameRepository,
        db=core.database_client,
    )

    music_brainz_client = providers.Singleton(MusicBrainzClient)

    track_provider = providers.Factory(
        TrackProvider,
        spotify_client=spotify.client,
        music_brainz_client=music_brainz_client,
    )

    abort_game_handler = providers.Factory(
        AbortGame.Handler,
        game_repository=game_repository,
        notifier=notifier,
    )

    buy_track_handler = providers.Factory(
        BuyTrack.Handler,
        game_repository=game_repository,
        track_provider=track_provider,
        notifier=notifier,
    )

    complete_turn_handler = providers.Factory(
        CompleteTurn.Handler,
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
        track_provider=track_provider,
        notifier=notifier,
    )

    exchange_track_handler = providers.Factory(
        ExchangeTrack.Handler,
        game_repository=game_repository,
        track_provider=track_provider,
        notifier=notifier,
    )

    get_game_handler = providers.Factory(
        GetGame.Handler,
        game_repository=game_repository,
    )

    get_game__users_handler = providers.Factory(
        GetGameUsers.Handler,
        game_repository=game_repository,
        user_repository=users.user_repository,
    )

    join_game_handler = providers.Factory(
        JoinGame.Handler,
        game_repository=game_repository,
        user_repository=users.user_repository,
        notifier=notifier,
    )

    leave_game_handler = providers.Factory(
        LeaveGame.Handler,
        game_repository=game_repository,
        track_provider=track_provider,
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
        track_provider=track_provider,
        notifier=notifier,
    )

    unregister_notification_channel_handler = providers.Factory(
        UnregisterNotificationChannel.Handler,
        game_repository=game_repository,
        notifier=notifier,
    )
