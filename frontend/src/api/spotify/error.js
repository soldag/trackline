class SpotifyError extends Error {
  code = "SPOTIFY_ERROR";

  constructor(message, statusCode = null) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default SpotifyError;
