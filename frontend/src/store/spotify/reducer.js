import { createReducer, isAnyOf } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { resetState } from "@/store/common/actions";

import {
  clearPlaylistSearchResults,
  increasePlaybackProgress,
  invalidateAccessToken,
  setAccessToken,
  setPlaybackState,
  unwatchPlayback,
} from "./actions";
import {
  completeAuth,
  fetchCurrentUser,
  fetchRecommendedPlaylists,
  pause,
  play,
  searchPlaylists,
  setVolume,
} from "./thunks";

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
      state.isLoggedIn = true;
      state.accessToken = token;
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

    .addCase(unwatchPlayback, (state) => {
      state.playback = initialState.playback;
    })

    .addCase(clearPlaylistSearchResults, (state) => {
      state.playlists.searchResults = [];
    })

    .addCase(
      fetchRecommendedPlaylists.fulfilled,
      (state, { payload: { playlists } }) => {
        state.playlists.recommendations = playlists;
      },
    )

    .addCase(searchPlaylists.fulfilled, (state, { payload: { playlists } }) => {
      state.playlists.searchResults = playlists;
    })

    .addCase(pause.fulfilled, (state) => {
      state.playback.isActive = true;
      state.playback.isPlaying = false;
    })

    .addCase(play.fulfilled, (state, { payload: { trackId } }) => {
      state.playback.isActive = true;
      state.playback.isPlaying = true;
      if (trackId) {
        state.playback.progress = 0;
      }
    })

    .addCase(setVolume.fulfilled, (state, { payload: { volume } }) => {
      state.playback.volume = volume;
    })

    .addMatcher(
      isAnyOf(completeAuth.fulfilled, fetchCurrentUser.fulfilled),
      (state, { payload: { user } }) => {
        state.isLoggedIn = true;
        state.user = user;
      },
    );
});

export default persistReducer(persistConfig, reducer);
