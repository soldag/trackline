import createSagaMiddleware from "@redux-saga/core";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { PERSIST, persistStore } from "redux-persist";
import { all } from "redux-saga/effects";

import spotifyApi from "@/api/spotify";
import tracklineApi from "@/api/trackline";
import * as auth from "@/store/auth";
import * as errors from "@/store/errors";
import * as games from "@/store/games";
import * as loading from "@/store/loading";
import * as spotify from "@/store/spotify";
import * as timing from "@/store/timing";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: combineReducers({
    auth: auth.reducer,
    errors: errors.reducer,
    loading: loading.reducer,
    games: games.reducer,
    spotify: spotify.reducer,
    timing: timing.reducer,
  }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: { warnAfter: 128 },
      serializableCheck: {
        warnAfter: 128,
        ignoredActions: [PERSIST],
      },
    }).concat(sagaMiddleware),
  devTools: {
    actionsDenylist: [
      spotify.actions.setPlaybackState,
      spotify.actions.increasePlaybackProgress,
    ],
  },
});

const persistor = persistStore(store);

sagaMiddleware.run(function* () {
  yield all([...auth.sagas, ...games.sagas, ...spotify.sagas]);
});

tracklineApi.setup({
  getSessionToken: () => store.getState()?.auth?.sessionToken,
  setSessionToken: (token) =>
    store.dispatch(auth.actions.setSessionToken({ token })),
  setTimeDeviation: (value) =>
    store.dispatch(
      timing.actions.setTimeDeviation({ service: "trackline", value }),
    ),
});
spotifyApi.setup({
  getAccessToken: () => store.getState()?.spotify?.accessToken,
  setAccessToken: (token) =>
    store.dispatch(spotify.actions.setAccessToken({ token })),
});

export { store, persistor };
