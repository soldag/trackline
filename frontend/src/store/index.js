import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { PERSIST, persistStore } from "redux-persist";

import spotifyApi from "@/api/spotify";
import tracklineApi from "@/api/trackline";
import * as auth from "@/store/auth";
import * as errors from "@/store/errors";
import * as games from "@/store/games";
import * as loading from "@/store/loading";
import * as spotify from "@/store/spotify";
import * as timing from "@/store/timing";

const store = configureStore({
  reducer: combineReducers({
    auth: auth.reducer,
    errors: errors.reducer,
    loading: loading.reducer,
    games: games.reducer,
    spotify: spotify.reducer,
    timing: timing.reducer,
  }),
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({
      immutableCheck: { warnAfter: 128 },
      serializableCheck: {
        warnAfter: 128,
        ignoredActions: [PERSIST],
      },
    }),
    auth.middleware,
    games.middleware,
    spotify.middleware,
  ],
  devTools: {
    actionsDenylist: [
      spotify.setPlaybackState,
      spotify.increasePlaybackProgress,
    ],
  },
});

const persistor = persistStore(store);

tracklineApi.setup({
  getSessionToken: () => store.getState()?.auth?.sessionToken,
  setSessionToken: (token) => {
    if (token) {
      store.dispatch(auth.setSessionToken({ token }));
    } else {
      store.dispatch(auth.invalidateSession());
    }
  },
  setTimeDeviation: (value) =>
    store.dispatch(timing.setTimeDeviation({ service: "trackline", value })),
});
spotifyApi.setup({
  getAccessToken: () => store.getState()?.spotify?.accessToken,
  setAccessToken: (token) => {
    if (token) {
      store.dispatch(spotify.setAccessToken({ token }));
    } else {
      store.dispatch(spotify.invalidateAccessToken());
    }
  },
});

export { store, persistor };
