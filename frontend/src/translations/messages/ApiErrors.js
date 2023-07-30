import { defineMessages } from "react-intl";

export default defineMessages({
  // Common

  UNEXPECTED_ERROR: {
    id: "ApiErrors.unexpectedError",
    defaultMessage: "An unexpected error occurred.",
  },
  VALIDATION_ERROR: {
    id: "ApiErrors.validationError",
    defaultMessage: "The entered data is invalid. Please check and try again.",
  },

  // Auth

  WRONG_CREDENTIALS: {
    id: "ApiErrors.wrongCredentials",
    defaultMessage:
      "The entered username or password is wrong. Please try again.",
  },

  // Games

  ALREADY_JOINED: {
    id: "ApiErrors.alreadyJoined",
    defaultMessage: "You have joined this game already.",
  },
  GAME_MASTER_CANNOT_LEAVE: {
    id: "ApiErrors.gameMasterCannotLeave",
    defaultMessage: "The game master cannot leave the game.",
  },
  GAME_NOT_FOUND: {
    id: "ApiErrors.gameNotFound",
    defaultMessage: "The game does not exist.",
  },
  INACTIVE_PLAYER: {
    id: "ApiErrors.inactivePlayer",
    defaultMessage: "Only the active player can perform this operation.",
  },
  INACTIVE_TURN: {
    id: "ApiErrors.inactiveTurn",
    defaultMessage: "The turn is not active.",
  },
  INSUFFICIENT_TOKENS: {
    id: "ApiErrors.insufficientTokens",
    defaultMessage: "You don't have enough tokens to perform this operation.",
  },
  INVALID_POSITION: {
    id: "ApiErrors.invalidPosition",
    defaultMessage: "This position exceeds the boundaries of the timeline.",
  },
  NO_GAME_MASTER: {
    id: "ApiErrors.noGameMaster",
    defaultMessage: "Only the game master can perform this operation.",
  },
  TURN_COMPLETED: {
    id: "ApiErrors.turnCompleted",
    defaultMessage: "You have already completed this turn.",
  },
  TURN_GUESSED: {
    id: "ApiErrors.turnGuessed",
    defaultMessage: "You can only guess once per turn.",
  },
  TURN_NOT_FOUND: {
    id: "ApiErrors.turnNotFound",
    defaultMessage: "The turn does not exist.",
  },
  UNEXPECTED_STATE: {
    id: "ApiErrors.unexpectedState",
    defaultMessage:
      "The game is not in the correct state to perform this operation.",
  },

  // Spotify

  INVALID_SPOTIFY_AUTH_CODE: {
    id: "ApiErrors.invalidSpotifyAuthToken",
    defaultMessage: "The Spotify authorization code is invalid.",
  },

  INVALID_SPOTIFY_REFRESH_TOKEN: {
    id: "ApiErrors.invalidSpotifyRefreshToken",
    defaultMessage: "The Spotify refresh token is invalid.",
  },

  UNSUPPORTED_SPOTIFY_PRODUCT: {
    id: "ApiErrors.unsupportedSpotifyProduct",
    defaultMessage: "Spotify Premium is required to create a game.",
  },

  // Users

  USER_NOT_FOUND: {
    id: "ApiErrors.userNotFound",
    defaultMessage: "The user does not exist",
  },
  USERNAME_EXISTS: {
    id: "ApiErrors.usernameExists",
    defaultMessage: "This username is already taken.",
  },
});
