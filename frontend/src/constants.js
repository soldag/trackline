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

export const ERROR_CODES = {
  NETWORK: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT_ERROR",
  API: "API_ERROR",
  SPOTIFY: "SPOTIFY_ERROR",
};

export const GAME_STATES = {
  WAITING_FOR_PLAYERS: "waiting_for_players",
  STARTED: "started",
  GUESSING: "guessing",
  SCORING: "scoring",
  COMPLETED: "completed",
  ABORTED: "aborted",
};
export const TURN_GAME_STATES = [GAME_STATES.GUESSING, GAME_STATES.SCORING];

export const MIN_INITIAL_TOKENS = 0;
export const MAX_INITIAL_TOKENS = 5;
export const DEFAULT_INITIAL_TOKENS = 2;

export const MIN_MAX_TOKENS = TOKEN_COST_BUY_TRACK;
export const MAX_MAX_TOKENS = 10;
export const DEFAULT_MAX_TOKENS = 5;

export const MIN_TIMELINE_LENGTH = 5;
export const MAX_TIMELINE_LENGTH = 20;
export const DEFAULT_TIMELINE_LENGTH = 10;

export const ARTIST_MATCH_MODES = {
  ALL: "all",
  ONE: "one",
};

export const TITLE_MATCH_MODE = {
  FULL: "full",
  MAIN: "main",
};

export const CREDITS_STRICTNESS = {
  EXACT: "exact",
  STRICT: "strict",
  MODERATE: "moderate",
  RELAXED: "relaxed",
};

export const CREDITS_STRICTNESS_VALUES = {
  [CREDITS_STRICTNESS.EXACT]: {
    artistsMatchMode: ARTIST_MATCH_MODES.ALL,
    titleMatchMode: TITLE_MATCH_MODE.FULL,
    creditsSimilarityThreshold: 1.0,
  },
  [CREDITS_STRICTNESS.STRICT]: {
    artistsMatchMode: ARTIST_MATCH_MODES.ALL,
    titleMatchMode: TITLE_MATCH_MODE.FULL,
    creditsSimilarityThreshold: 0.9,
  },
  [CREDITS_STRICTNESS.MODERATE]: {
    artistsMatchMode: ARTIST_MATCH_MODES.ONE,
    titleMatchMode: TITLE_MATCH_MODE.MAIN,
    creditsSimilarityThreshold: 0.9,
  },
  [CREDITS_STRICTNESS.RELAXED]: {
    artistsMatchMode: ARTIST_MATCH_MODES.ONE,
    titleMatchMode: TITLE_MATCH_MODE.MAIN,
    creditsSimilarityThreshold: 0.8,
  },
};

export const DEFAULT_CREDITS_STRICTNESS = CREDITS_STRICTNESS.MODERATE;

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

export const LOBBY_TRACK_ID = "5WIHTBujvgqKbbOp1mWQiz";
export const GAME_COMPLETION_TRACK_ID = "1ZfbMOw5VSh5Qqr8hgLCkJ";
