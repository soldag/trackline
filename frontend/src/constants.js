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

export const REQUIRED_SPOTIFY_SCOPES = [
  "playlist-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
  "user-read-private",
];

export const RECOMMENDED_PLAYLIST_IDS = [
  "37i9dQZF1DWSV3Tk4GO2fq", // 50s
  "37i9dQZF1DWYfQ0uxBYM90", // 60s
  "37i9dQZF1DWWUPe5aPjWhG", // 70s
  "37i9dQZF1DXdCc7Q1hwtuv", // 80s
  "37i9dQZF1DWTWEW1zqSeEj", // 90s
  "37i9dQZF1DWXeOurMWUII5", // 00s
  "37i9dQZF1DX8bHrtXvaJhx", // 10s
];

export const LOBBY_TRACK_ID = "5WIHTBujvgqKbbOp1mWQiz";
export const GAME_COMPLETION_TRACK_ID = "1ZfbMOw5VSh5Qqr8hgLCkJ";
