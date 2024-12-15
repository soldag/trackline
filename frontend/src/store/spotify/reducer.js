import { createReducer } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { resetState } from "~/store/common/actions";
import { isSuccess } from "~/store/utils/matchers";

import {
  clearPlaylistSearchResults,
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
  setVolume,
} from "./actions";

const persistConfig = {
  key: "spotify",
  storage,
  whitelist: ["accessToken"],
};

const initialState = {
  isLoggedIn: null,
  user: null,
  accessToken: null,
  playback: {
    isActive: false,
    isPlaying: null,
    trackId: null,
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

    .addCase(clearPlaylistSearchResults, (state) => {
      state.playlists.searchResults = [];
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

    .addMatcher(isSuccess(setVolume), (state, { payload: { volume } }) => {
      state.playback.volume = volume;
    });
});

export default persistReducer(persistConfig, reducer);
