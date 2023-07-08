from datetime import timedelta


APP_NAME = "trackline"

SESSION_TOKEN_LENGTH = 32
SESSION_EXPIRY_INTERVAL = timedelta(days=7)

MIN_PLAYER_COUNT = 2

DEFAULT_INITIAL_TOKENS = 2
DEFAULT_TIMELINE_LENGTH = 10
DEFAULT_GUESS_TIMEOUT = 30000

TOKEN_COST_POSITION_GUESS = 1
TOKEN_COST_YEAR_GUESS = 1
TOKEN_COST_EXCHANGE_TRACK = 1
TOKEN_COST_BUY_TRACK = 3

TOKEN_GAIN_YEAR_GUESS = 1

MUSICBRAINZ_MIN_SCORE = 70

SPOTIFY_PRODUCT_PREMIUM = "premium"
