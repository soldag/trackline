import {
  ArtistMatchMode,
  CreditsStrictness,
  GameState,
  TitleMatchMode,
} from "@/types/games";

export const HTTP_REQUEST_TIMEOUT = 10000;

export const WS_RECONNECT_MIN_INTERVAL = 200;
export const WS_RECONNECT_MAX_INTERVAL = 10000;

export const PLAYBACK_POLL_INTERVAL = 2000;
export const PLAYBACK_POLL_RETRY_MIN_INTERVAL = 500;
export const PLAYBACK_POLL_RETRY_MAX_INTERVAL = 10000;
export const PLAYBACK_POLL_COMMAND_COOLDOWN = 2000;
export const PLAYBACK_SIMULATE_PROGRESS_INTERVAL = 250;

export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 24;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 32;

export const GAME_ID_LENGTH = 24;
export const GAME_ID_REGEX = /^[a-f\d]{24}$/;
export const JOIN_URL_REGEX = new RegExp(
  `^${document.location.origin}/games/join/([a-f\\d]{24})$`,
);

export const MIN_PLAYER_COUNT = 2;

export const TOKEN_COST_POSITION_GUESS = 1;
export const TOKEN_COST_RELEASE_YEAR_GUESS = 1;
export const TOKEN_COST_CREDITS_GUESS = 1;
export const TOKEN_COST_EXCHANGE_TRACK = 1;
export const TOKEN_COST_BUY_TRACK = 3;

export const MIN_INITIAL_TOKENS = 0;
export const MAX_INITIAL_TOKENS = 5;
export const DEFAULT_INITIAL_TOKENS = 2;

export const MIN_MAX_TOKENS = TOKEN_COST_BUY_TRACK;
export const MAX_MAX_TOKENS = 10;
export const DEFAULT_MAX_TOKENS = 5;

export const MIN_TIMELINE_LENGTH = 5;
export const MAX_TIMELINE_LENGTH = 20;
export const DEFAULT_TIMELINE_LENGTH = 10;

export const TURN_GAME_STATES = [GameState.Guessing, GameState.Scoring];

export const CREDITS_STRICTNESS_VALUES = {
  [CreditsStrictness.Exact]: {
    artistsMatchMode: ArtistMatchMode.All,
    titleMatchMode: TitleMatchMode.Full,
    creditsSimilarityThreshold: 1.0,
  },
  [CreditsStrictness.Strict]: {
    artistsMatchMode: ArtistMatchMode.All,
    titleMatchMode: TitleMatchMode.Full,
    creditsSimilarityThreshold: 0.9,
  },
  [CreditsStrictness.Moderate]: {
    artistsMatchMode: ArtistMatchMode.One,
    titleMatchMode: TitleMatchMode.Main,
    creditsSimilarityThreshold: 0.9,
  },
  [CreditsStrictness.Relaxed]: {
    artistsMatchMode: ArtistMatchMode.One,
    titleMatchMode: TitleMatchMode.Main,
    creditsSimilarityThreshold: 0.8,
  },
};

export const DEFAULT_CREDITS_STRICTNESS = CreditsStrictness.Moderate;

export const REQUIRED_SPOTIFY_SCOPES = [
  "playlist-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
  "user-read-private",
];

export const RECOMMENDED_PLAYLIST_IDS = [
  "3eDWy05e10gmu9hXlKiDhC", // 1950s
  "4oWkHPbwjafNpMTOtvVGub", // 1960s
  "5CpMCrXELUzHpIzSPSs5fb", // 1970s
  "37qjtYGaWJhnIGa0lDg6Tq", // 1980s
  "2Ma2qMbyiTeOYjgaXAKlbW", // 1990s
  "2Mh68CM4k6yYNsu2DlzTbS", // 2000s
  "4Vvh40a9NGsjrKUmzD8pWU", // 2010s
  "5qVjOg9MTzJSJSPA6WwTtV", // 2020s
  "5hJtFBDrJWohthyHb83zce", // Billboard charts
  "1dDls1kVQqj17WJNwB3GZ9", // German charts
  "7kdffd5tyCGLTlrvYpK6Ue", // Trackline Super Mix
  "1t5w9AS3kaImejMM2o4yf3", // Hitster
];

export const LOBBY_TRACK_ID = "71wc2McPHycCEESSMwP98h";
export const GAME_COMPLETION_TRACK_ID = "1ZfbMOw5VSh5Qqr8hgLCkJ";
