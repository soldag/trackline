import { createAction } from "@reduxjs/toolkit";
import { createRoutine } from "redux-saga-routines";

export const stopRoutines = createAction("GAMES/STOP_ROUTINES");

export const clearGame = createAction("GAMES/CLEAR_GAME");

export const fetchGame = createRoutine("GAMES/FETCH");
export const fetchGameUsers = createRoutine("GAMES/FETCH_USERS");

export const createGame = createRoutine("GAMES/CREATE");
export const startGame = createRoutine("GAMES/START");
export const abortGame = createRoutine("GAMES/ABORT");

export const joinGame = createRoutine("GAMES/JOIN");
export const leaveGame = createRoutine("GAMES/LEAVE");

export const createTurn = createRoutine("GAMES/CREATE_TURN");
export const passTurn = createRoutine("GAMES/PASS_TURN");
export const scoreTurn = createRoutine("GAMES/SCORE_TURN");
export const completeTurn = createRoutine("GAMES/COMPLETE_TURN");

export const guessTrackReleaseYear = createRoutine(
  "GAMES/GUESS_TRACK_RELEASE_YEAR",
);
export const guessTrackCredits = createRoutine("GAMES/GUESS_TRACK_CREDITS");

export const buyTrack = createRoutine("GAMES/BUY_TRACK");
export const exchangeTrack = createRoutine("GAMES/EXCHANGE_TRACK");

export const listenNotifications = createAction("GAMES/LISTEN_NOTIFICATION");
export const unlistenNotifications = createAction(
  "GAMES/UNLISTEN_NOTIFICATIONS",
);

export const playerJoined = createAction("GAME/PLAYER_ADDED");
export const playerLeft = createAction("GAME/PLAYER_REMOVED");
export const gameStarted = createAction("GAME/STARTED");
export const gameAborted = createAction("GAME/ABORTED");
export const turnCreated = createAction("GAME/TURN_CREATED");
export const trackExchanged = createAction("GAME/TRACK_EXCHANGED");
export const releaseYearGuessCreated = createAction(
  "GAME/RELEASE_YEAR_GUESS_CREATED",
);
export const creditsGuessCreated = createAction("GAME/CREDITS_GUESS_CREATED");
export const turnPassed = createAction("GAME/TURN_PASSED");
export const turnScored = createAction("GAME/TURN_SCORED");
export const turnCompleted = createAction("GAME/TURN_COMPLETED");
export const trackBought = createAction("GAME/TRACK_BOUGHT");
