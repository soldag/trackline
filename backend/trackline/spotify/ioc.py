from dependency_injector import containers, providers

from trackline.spotify.client import SpotifyClient
from trackline.spotify.use_cases import GetAccessToken, RefreshAccessToken


async def create_client(*args, **kwargs):
    service = SpotifyClient(*args, **kwargs)
    await service.initialize()
    try:
        yield service
    finally:
        await service.close()


class SpotifyContainer(containers.DeclarativeContainer):
    core = providers.DependenciesContainer()

    client = providers.Resource(
        create_client,
        settings=core.settings,
    )

    get_access_token_handler = providers.Factory(
        GetAccessToken.Handler,
        spotify_client=client,
    )

    refresh_access_token_handler = providers.Factory(
        RefreshAccessToken.Handler,
        spotify_client=client,
    )
