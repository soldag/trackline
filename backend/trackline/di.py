from injector import Injector

from trackline.core.di import CoreModule
from trackline.games.di import GamesModule
from trackline.spotify.di import SpotifyModule

injector = Injector([CoreModule(), GamesModule(), SpotifyModule()])
