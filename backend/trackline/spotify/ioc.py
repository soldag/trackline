from dependency_injector import containers, providers

from trackline.configuration import (
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URL,
)
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
    client = providers.Resource(
        create_client,
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET,
        redirect_url=SPOTIFY_REDIRECT_URL,
    )

    get_access_token_handler = providers.Factory(
        GetAccessToken.Handler,
        spotify_client=client,
    )

    refresh_access_token_handler = providers.Factory(
        RefreshAccessToken.Handler,
        spotify_client=client,
    )
