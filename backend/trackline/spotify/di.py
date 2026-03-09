from injector import Binder, Module, singleton

from trackline.spotify.services.auth_provider import SpotifyAuthProvider
from trackline.spotify.services.spotify_client import SpotifyClient


class SpotifyModule(Module):
    def configure(self, binder: Binder) -> None:
        binder.bind(SpotifyAuthProvider, scope=singleton)
        binder.bind(SpotifyClient, scope=singleton)
