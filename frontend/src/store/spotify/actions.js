import { createAction } from "@reduxjs/toolkit";
import { createRoutine } from "redux-saga-routines";

export const startAuth = createAction("SPOTIFY/START_AUTH");
export const completeAuth = createRoutine("SPOTIFY/COMPLETE_AUTH");
export const setAccessToken = createAction("SPOTIFY/SET_ACCESS_TOKEN");
export const invalidateAccessToken = createAction(
  "SPOTIFY/INVALIDATE_ACCESS_TOKEN",
);

export const fetchCurrentUser = createRoutine("SPOTIFY/FETCH_CURRENT_USER");

export const play = createRoutine("SPOTIFY/PLAY");
export const pause = createRoutine("SPOTIFY/PAUSE");
export const setVolume = createRoutine("SPOTIFY/SET_VOLUME");

export const watchPlayback = createAction("SPOTIFY/WATCH_PLAYBACK");
export const unwatchPlayback = createAction("SPOTIFY/UNWATCH_PLAYBACK");
export const setPlaybackState = createAction("SPOTIFY/SET_PLAYBACK_STATE");
export const increasePlaybackProgress = createAction(
  "SPOTIFY/INCREASE_PLAYBACK_PROGRESS",
);

export const fetchRecommendedPlaylists = createRoutine(
  "SPOTIFY/FETCH_RECOMMENDED_PLAYLISTS",
);
export const searchPlaylists = createRoutine("SPOTIFY/SEARCH_PLAYLISTS");
export const clearPlaylistSearchResults = createAction(
  "SPOTIFY/CLEAR_PLAYLIST_SEARCH_RESULTS",
);
