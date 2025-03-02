import { createAction } from "@reduxjs/toolkit";

import { PREFIX } from "./constants";

export const clearGame = createAction(`${PREFIX}/clearGame`);

export const playerJoined = createAction(`${PREFIX}/playerAdded`);

export const playerLeft = createAction(`${PREFIX}/playerRemoved`);

export const gameStarted = createAction(`${PREFIX}/started`);

export const gameAborted = createAction(`${PREFIX}/aborted`);

export const turnCreated = createAction(`${PREFIX}/turnCreated`);

export const trackExchanged = createAction(`${PREFIX}/trackExchanged`);

export const releaseYearGuessCreated = createAction(
  `${PREFIX}/releaseYearGuessCreated`,
);

export const creditsGuessCreated = createAction(
  `${PREFIX}/creditsGuessCreated`,
);

export const turnPassed = createAction(`${PREFIX}/turnPassed`);

export const turnScored = createAction(`${PREFIX}/turnScored`);

export const turnCompleted = createAction(`${PREFIX}/turnCompleted`);

export const trackBought = createAction(`${PREFIX}/trackBought`);

export const correctionProposed = createAction(`${PREFIX}/correctionProposed`);

export const correctionVoted = createAction(`${PREFIX}/correctionVoted`);
