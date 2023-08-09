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
  takeLatest,
} from "redux-saga/effects";

import tracklineApi from "~/api/trackline";
import {
  WS_RECONNECT_MAX_INTERVAL,
  WS_RECONNECT_MIN_INTERVAL,
} from "~/constants";
import { registerSagaHandlers } from "~/store/utils/sagas";

import {
  abortGame,
  buyTrack,
  completeTurn,
  createGame,
  createTurn,
  exchangeTrack,
  fetchGame,
  fetchGameUsers,
  gameAborted,
  gameStarted,
  guessTrack,
  joinGame,
  leaveGame,
  listenNotifications,
  playerJoined,
  playerLeft,
  rejectGuess,
  scoreTurn,
  startGame,
  trackBought,
  trackExchanged,
  trackGuessed,
  turnCompleted,
  turnCreated,
  turnScored,
  unlistenNotifications,
} from "./actions";

const WS_OPEN = "WS_OPEN";

const NOTIFICATION_ACTIONS = {
  player_joined: playerJoined,
  player_left: playerLeft,
  game_started: gameStarted,
  game_aborted: gameAborted,
  new_turn: turnCreated,
  new_guess: trackGuessed,
  track_exchanged: trackExchanged,
  turn_completed: turnCompleted,
  turn_scored: turnScored,
  track_bought: trackBought,
};

function* handleFetchGame({ gameId }) {
  const game = yield call(tracklineApi.games.get, { gameId });
  return { game };
}

function* handleFetchGameUsers({ gameId }) {
  const users = yield call(tracklineApi.games.getUsers, { gameId });
  return { users };
}

function* handleCreateGame({ playlistIds, spotifyMarket }) {
  const game = yield call(tracklineApi.games.create, {
    playlistIds,
    spotifyMarket,
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

function* handleGuessTrack({
  gameId,
  turnId,
  position = null,
  releaseYear = null,
}) {
  const guess = yield call(tracklineApi.games.createGuess, {
    gameId,
    turnId,
    position,
    releaseYear,
  });
  return { guess };
}

function* handleRejectGuess({ gameId, turnId }) {
  const guess = yield call(tracklineApi.games.createGuess, { gameId, turnId });
  return { guess };
}

function* handleScoreTurn({ gameId, turnId }) {
  const scoring = yield call(tracklineApi.games.scoreTurn, { gameId, turnId });
  return { scoring };
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
  const track = yield call(tracklineApi.games.exchangeTrack, {
    gameId,
    turnId,
  });
  return { track };
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

export default registerSagaHandlers([
  [fetchGame, handleFetchGame],
  [fetchGameUsers, handleFetchGameUsers],
  [createGame, handleCreateGame],
  [startGame, handleStartGame],
  [abortGame, handleAbortGame],
  [joinGame, handleJoinGame],
  [leaveGame, handleLeaveGame],
  [createTurn, handleCreateTurn],
  [exchangeTrack, handleExchangeTrack],
  [guessTrack, handleGuessTrack],
  [rejectGuess, handleRejectGuess],
  [scoreTurn, handleScoreTurn],
  [completeTurn, handleCompleteTurn],
  [buyTrack, handleBuyTrack],
  [
    listenNotifications,
    handleListenNotifications,
    { effectCreator: takeLatest },
  ],
]);
