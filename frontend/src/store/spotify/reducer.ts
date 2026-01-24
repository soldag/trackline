import { createReducer, isAnyOf } from "@reduxjs/toolkit";
import { PersistConfig, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { resetState } from "@/store/common/actions";
import {
  PlaybackState,
  SpotifyAccessToken,
  SpotifyPlaylist,
  SpotifyUser,
} from "@/types/spotify";
import invariant from "@/utils/invariant";

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

interface SpotifyState {
  isLoggedIn: boolean | null;
  user: SpotifyUser | null;
  accessToken: SpotifyAccessToken | null;
  playback: PlaybackState;
  playlists: {
    recommendations: SpotifyPlaylist[];
    searchResults: SpotifyPlaylist[];
  };
}

const persistConfig: PersistConfig<SpotifyState> = {
  key: "spotify",
  storage,
  whitelist: ["accessToken"],
};

const initialState: SpotifyState = {
  isLoggedIn: null,
  user: null,
  accessToken: null,
  playback: {
    isActive: false,
    isPlaying: false,
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

    .addCase(setPlaybackState, (state, { payload: { playbackState } }) => {
      state.playback = playbackState;
    })

    .addCase(increasePlaybackProgress, (state, { payload: { value } }) => {
      const { progress, duration } = state.playback;
      invariant(progress != null);
      invariant(duration != null);

      state.playback.progress = Math.min(progress + value, duration);
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
        state.playback.trackId = trackId;
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
