import { createReducer } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { resetState } from "store/common/actions";
import {
  isFailure,
  isFulfill,
  isSuccess,
  isTrigger,
} from "store/utils/matchers";

import * as actions from "./actions";

const {
  completeAuth,
  fetchCurrentUser,
  fetchRecommendedPlaylists,
  increasePlaybackProgress,
  invalidateAccessToken,
  pause,
  play,
  searchPlaylists,
  setAccessToken,
  setPlaybackState,
} = actions;

const persistConfig = {
  key: "spotify",
  storage,
  whitelist: ["accessToken"],
};

const initialState = {
  loading: false,
  error: null,
  isLoggedIn: null,
  user: null,
  accessToken: null,
  playback: {
    isActive: false,
    isPlaying: null,
    progress: null,
    duration: null,
    volume: null,
  },
  playlists: {
    recommendations: [],
    searchResults: [],
  },
};

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(resetState, () => ({
      ...initialState,
      isLoggedIn: false,
    }))

    .addCase(setAccessToken, (state, { payload: { token } }) => {
      if (token) {
        state.isLoggedIn = true;
        state.accessToken = token;
      } else {
        state.isLoggedIn = false;
        state.user = null;
        state.accessToken = null;
      }
    })

    .addCase(invalidateAccessToken, (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.accessToken = null;
    })

    .addCase(setPlaybackState, (state, { payload: playbackState }) => {
      state.playback = {
        ...state.playback,
        ...playbackState,
      };
    })

    .addCase(increasePlaybackProgress, (state, { payload: { value } }) => {
      state.playback.progress = Math.min(
        state.playback.progress + value,
        state.playback.duration,
      );
    })

    .addMatcher(isTrigger(...Object.values(actions)), (state) => {
      state.loading = true;
      state.error = null;
    })

    .addMatcher(
      isSuccess(completeAuth, fetchCurrentUser),
      (state, { payload: { user } }) => {
        state.isLoggedIn = true;
        state.user = user;
      },
    )

    .addMatcher(
      isSuccess(fetchRecommendedPlaylists),
      (state, { payload: { playlists } }) => {
        state.playlists.recommendations = playlists;
      },
    )

    .addMatcher(
      isSuccess(searchPlaylists),
      (state, { payload: { playlists } }) => {
        state.playlists.searchResults = playlists;
      },
    )

    .addMatcher(isSuccess(pause), (state) => {
      state.playback.isActive = true;
      state.playback.isPlaying = false;
    })

    .addMatcher(isSuccess(play), (state, { payload: { trackId } }) => {
      state.playback.isActive = true;
      state.playback.isPlaying = true;
      if (trackId) {
        state.playback.progress = 0;
      }
    })

    .addMatcher(
      isSuccess(actions.setVolume),
      (state, { payload: { volume } }) => {
        state.playback.volume = volume;
      },
    )

    .addMatcher(
      isFailure(...Object.values(actions)),
      (state, { payload: { error } }) => {
        state.error = error;
      },
    )

    .addMatcher(isFulfill(...Object.values(actions)), (state) => {
      state.loading = false;
    });
});

export default persistReducer(persistConfig, reducer);
