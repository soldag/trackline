from injector import Binder, Module, singleton

from trackline.spotify.services.client import SpotifyClient


class SpotifyModule(Module):
    def configure(self, binder: Binder) -> None:
        binder.bind(SpotifyClient, scope=singleton)
