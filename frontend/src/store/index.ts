import { configureStore } from "@reduxjs/toolkit";
import { PERSIST, persistStore } from "redux-persist";

import spotifyApi from "@/api/spotify";
import tracklineApi from "@/api/trackline";
import * as auth from "@/store/auth";
import * as games from "@/store/games";
import * as spotify from "@/store/spotify";
import * as timing from "@/store/timing";
import { ServiceType } from "@/types/api";
import { SpotifyAccessToken } from "@/types/spotify";

import rootReducer from "./rootReducer";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: { warnAfter: 128 },
      serializableCheck: {
        warnAfter: 128,
        ignoredActions: [PERSIST],
      },
    }).concat([auth.middleware, games.middleware, spotify.middleware]),
  devTools: {
    actionsDenylist: [
      spotify.setPlaybackState.type,
      spotify.increasePlaybackProgress.type,
    ],
  },
});

const persistor = persistStore(store);

tracklineApi.setup({
  getSessionToken: () => store.getState()?.auth?.sessionToken,
  setSessionToken: (token: string | null) => {
    if (token) {
      store.dispatch(auth.setSessionToken({ token }));
    } else {
      store.dispatch(auth.invalidateSession());
    }
  },
  setTimeDeviation: (value: number) =>
    store.dispatch(
      timing.setTimeDeviation({ service: ServiceType.Trackline, value }),
    ),
});
spotifyApi.setup({
  getAccessToken: () => store.getState()?.spotify?.accessToken,
  setAccessToken: (token: SpotifyAccessToken | null) => {
    if (token) {
      store.dispatch(spotify.setAccessToken({ token }));
    } else {
      store.dispatch(spotify.invalidateAccessToken());
    }
  },
});

export { store, persistor };
