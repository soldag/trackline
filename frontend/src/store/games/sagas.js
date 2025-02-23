import { camelizeKeys } from "humps";
import { END, eventChannel } from "redux-saga";
import {
  call,
  cancelled,
  delay,
  put,
  race,
  select,
  take,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";

import tracklineApi from "@/api/trackline";
import {
  ERROR_CODES,
  WS_RECONNECT_MAX_INTERVAL,
  WS_RECONNECT_MIN_INTERVAL,
} from "@/constants";
import { registerSagaHandlers } from "@/store/utils/sagas";

import {
  abortGame,
  buyTrack,
  completeTurn,
  correctionProposed,
  correctionVoted,
  createGame,
  createTurn,
  creditsGuessCreated,
  exchangeTrack,
  fetchGame,
  fetchGameUsers,
  gameAborted,
  gameStarted,
  guessTrackCredits,
  guessTrackReleaseYear,
  joinGame,
  leaveGame,
  listenNotifications,
  passTurn,
  playerJoined,
  playerLeft,
  proposeCorrection,
  releaseYearGuessCreated,
  scoreTurn,
  startGame,
  stopRoutines,
  trackBought,
  trackExchanged,
  turnCompleted,
  turnCreated,
  turnPassed,
  turnScored,
  unlistenNotifications,
  voteCorrection,
} from "./actions";

const WS_OPEN = "WS_OPEN";

const NOTIFICATION_ACTIONS = {
  player_joined: playerJoined,
  player_left: playerLeft,
  game_started: gameStarted,
  game_aborted: gameAborted,
  new_turn: turnCreated,
  release_year_guess_created: releaseYearGuessCreated,
  credits_guess_created: creditsGuessCreated,
  track_exchanged: trackExchanged,
  turn_passed: turnPassed,
  turn_completed: turnCompleted,
  turn_scored: turnScored,
  track_bought: trackBought,
  correction_proposed: correctionProposed,
  correction_voted: correctionVoted,
};

function* handleFetchGame({ gameId }) {
  const game = yield call(tracklineApi.games.get, { gameId });
  return { game };
}

function* handleFetchGameUsers({ gameId }) {
  const users = yield call(tracklineApi.games.getUsers, { gameId });
  return { users };
}

function* handleCreateGame({
  playlistIds,
  spotifyMarket,
  initialTokens,
  maxTokens,
  timelineLength,
  artistsMatchMode,
  titleMatchMode,
  creditsSimilarityThreshold,
}) {
  const game = yield call(tracklineApi.games.create, {
    playlistIds,
    spotifyMarket,
    initialTokens,
    maxTokens,
    timelineLength,
    artistsMatchMode,
    titleMatchMode,
    creditsSimilarityThreshold,
  });
  return { game };
}

function* handleStartGame({ gameId }) {
  const game = yield call(tracklineApi.games.start, { gameId });
  const turn = yield call(tracklineApi.games.createTurn, { gameId });
  return { game, turn };
}

function* handleAbortGame({ gameId }) {
  yield call(tracklineApi.games.abort, { gameId });
}

function* handleJoinGame({ gameId }) {
  try {
    yield call(tracklineApi.games.join, { gameId });
  } catch (e) {
    if (!e.errors?.some(({ code }) => code === "ALREADY_JOINED")) {
      throw e;
    }
  }

  const game = yield call(tracklineApi.games.get, { gameId });
  return { game };
}

function* handleLeaveGame({ gameId, userId }) {
  yield call(tracklineApi.games.leave, { gameId, userId });
}

function* handleCreateTurn({ gameId }) {
  const turn = yield call(tracklineApi.games.createTurn, { gameId });
  return { turn };
}

function* handleGuessTrackReleaseYear({
  gameId,
  turnId,
  turnRevisionId,
  position,
  year,
}) {
  const guess = yield call(tracklineApi.games.createReleaseYearGuess, {
    gameId,
    turnId,
    turnRevisionId,
    position,
    year,
  });

  return { guess };
}

function* handleGuessTrackCredits({
  gameId,
  turnId,
  turnRevisionId,
  artists,
  title,
}) {
  const guess = yield call(tracklineApi.games.createCreditsGuess, {
    gameId,
    turnId,
    turnRevisionId,
    artists,
    title,
  });

  return { guess };
}

function* handlePassTurn({ gameId, turnId }) {
  const turnPass = yield call(tracklineApi.games.passTurn, { gameId, turnId });

  return { turnPass };
}

function* handleScoreTurn({ gameId, turnId }) {
  const scoring = yield call(tracklineApi.games.scoreTurn, { gameId, turnId });
  return { scoring };
}

function* handleProposeCorrection({ gameId, turnId, releaseYear }) {
  const proposal = yield call(tracklineApi.games.proposeCorrection, {
    gameId,
    turnId,
    releaseYear,
  });
  return { proposal };
}

function* handleVoteCorrection({ gameId, turnId, agree }) {
  return yield call(tracklineApi.games.voteCorrection, {
    gameId,
    turnId,
    agree,
  });
}

function* handleCompleteTurn({ gameId, turnId }) {
  const userId = yield select((state) => state.auth.user?.id);
  const completion = yield call(tracklineApi.games.completeTurn, {
    gameId,
    turnId,
  });

  if (completion.turnCompleted) {
    yield put(createTurn({ gameId, turnId }));
  }

  return { userId, completion };
}

function* handleBuyTrack({ gameId, userId }) {
  const receipt = yield call(tracklineApi.games.buyTrack, { gameId, userId });
  return { receipt };
}

function* handleExchangeTrack({ gameId, turnId }) {
  const exchange = yield call(tracklineApi.games.exchangeTrack, {
    gameId,
    turnId,
  });
  return exchange;
}

function* handleFailure({ payload: { error } }) {
  const { code, trigger } = error;
  const gameId = trigger?.payload?.gameId;
  if (code === ERROR_CODES.API && gameId) {
    // Fetch current game after sync with backend in case of inconsistencies
    yield put(fetchGame({ gameId }));
  }
}

function* watchFailures(actions) {
  for (const action of actions) {
    yield takeEvery(action.FAILURE, handleFailure);
  }
}

function* handleListenNotifications({ gameId }) {
  let retries = 0;
  while (true) {
    const { cancellation } = yield race({
      listener: setupNotificationsListener({ gameId, reconnect: retries > 0 }),
      cancellation: take(unlistenNotifications),
    });
    if (cancellation) break;

    const interval = 2 ** retries * WS_RECONNECT_MIN_INTERVAL;
    yield delay(Math.min(interval, WS_RECONNECT_MAX_INTERVAL));

    retries += 1;
  }
}

function* setupNotificationsListener({ gameId, reconnect = false }) {
  const channel = eventChannel((emitter) => {
    const url = tracklineApi.notifications.getWebSocketUrl(gameId);
    const ws = new WebSocket(url);

    ws.addEventListener("open", () => emitter(WS_OPEN));
    ws.addEventListener("message", ({ data }) =>
      emitter(camelizeKeys(JSON.parse(data))),
    );
    ws.addEventListener("error", () => emitter(END));
    ws.addEventListener("close", () => emitter(END));

    return () => ws.close(1000);
  });

  try {
    while (true) {
      const notification = yield take(channel);

      if (notification === WS_OPEN) {
        // Fetch current game after reconnect to catch up with reality
        if (reconnect) {
          yield put(fetchGame({ gameId }));
        }
        continue;
      }

      try {
        yield handleNotification(notification);
      } catch (e) {
        console.error("Error while processing notification ", notification, e);
      }
    }
  } finally {
    if (yield cancelled()) {
      channel.close();
    }
  }
}

function* handleNotification(notification) {
  const { type, payload } = notification;

  const action = NOTIFICATION_ACTIONS[type];
  if (action) {
    yield put(action(payload));
  } else {
    console.warn("Unknown notification received: ", notification);
  }
}

export default [
  watchFailures([
    buyTrack,
    completeTurn,
    createGame,
    createTurn,
    exchangeTrack,
    guessTrackCredits,
    guessTrackReleaseYear,
    joinGame,
    leaveGame,
    passTurn,
    proposeCorrection,
    scoreTurn,
    voteCorrection,
  ]),
  ...registerSagaHandlers([
    [fetchGame, handleFetchGame, { cancelAction: stopRoutines }],
    [fetchGameUsers, handleFetchGameUsers, { cancelAction: stopRoutines }],
    [createGame, handleCreateGame, { cancelAction: stopRoutines }],
    [startGame, handleStartGame, { cancelAction: stopRoutines }],
    [abortGame, handleAbortGame, { cancelAction: stopRoutines }],
    [joinGame, handleJoinGame, { cancelAction: stopRoutines }],
    [leaveGame, handleLeaveGame, { cancelAction: stopRoutines }],
    [createTurn, handleCreateTurn, { cancelAction: stopRoutines }],
    [exchangeTrack, handleExchangeTrack, { cancelAction: stopRoutines }],
    [
      guessTrackReleaseYear,
      handleGuessTrackReleaseYear,
      { cancelAction: stopRoutines },
    ],
    [
      guessTrackCredits,
      handleGuessTrackCredits,
      { cancelAction: stopRoutines },
    ],
    [passTurn, handlePassTurn, { cancelAction: stopRoutines }],
    [scoreTurn, handleScoreTurn, { cancelAction: stopRoutines }],
    [
      proposeCorrection,
      handleProposeCorrection,
      { cancelAction: stopRoutines },
    ],
    [voteCorrection, handleVoteCorrection, { cancelAction: stopRoutines }],
    [completeTurn, handleCompleteTurn, { cancelAction: stopRoutines }],
    [buyTrack, handleBuyTrack, { cancelAction: stopRoutines }],
    [
      listenNotifications,
      handleListenNotifications,
      { effectCreator: takeLatest },
    ],
  ]),
];
