import { ERROR_CODES } from "constants";

class SpotifyError extends Error {
  code = ERROR_CODES.SPOTIFY;

  constructor(message, statusCode = null) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default SpotifyError;
