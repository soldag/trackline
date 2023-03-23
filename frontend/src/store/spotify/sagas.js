import { all, call, delay, fork, put, race, take } from "redux-saga/effects";

import spotifyApi from "api/spotify";
import tracklineApi from "api/trackline";
import {
  PLAYBACK_POLL_COMMAND_COOLDOWN,
  PLAYBACK_POLL_INTERVAL,
  PLAYBACK_POLL_RETRY_MAX_INTERVAL,
  PLAYBACK_POLL_RETRY_MIN_INTERVAL,
  PLAYBACK_SIMULATE_PROGRESS_INTERVAL,
  RECOMMENDED_PLAYLIST_IDS,
} from "constants";
import { ignoreError, registerSagaHandlers } from "store/utils/sagas";

import {
  completeAuth,
  fetchCurrentUser,
  fetchRecommendedPlaylists,
  increasePlaybackProgress,
  pause,
  play,
  searchPlaylists,
  setAccessToken,
  setPlaybackState,
  setVolume,
  startAuth,
  unwatchPlayback,
  watchPlayback,
} from "./actions";

function handleStartAuth() {
  window.location = spotifyApi.auth.getAuthorizeUrl();
}

function* handleCompleteAuth({ code }) {
  const accessToken = yield call(tracklineApi.spotify.getAccessToken, {
    code,
  });
  yield put(setAccessToken({ token: accessToken }));

  const user = yield call(spotifyApi.users.getMe);

  return { user };
}

function* handleFetchCurrentUser() {
  const user = yield call(spotifyApi.users.getMe);
  return { user };
}

function* handleFetchRecommendedPlaylists() {
  const playlists = yield all(
    RECOMMENDED_PLAYLIST_IDS.map((id) =>
      ignoreError(() => call(spotifyApi.playlists.get, { id }), {
        filter: (e) => e.statusCode === 404,
      }),
    ),
  );

  return {
    playlists: playlists.filter((p) => !!p),
  };
}

function* handleSearchPlaylists({ query, limit }) {
  const playlists = yield call(spotifyApi.playlists.search, { query, limit });

  return { playlists };
}

function* handlePause() {
  yield call(spotifyApi.player.pause);
}

function* handlePlay({ trackId } = {}) {
  yield call(spotifyApi.player.play, { trackId });
  return { trackId };
}

function* handleSetVolume({ volume }) {
  yield call(spotifyApi.player.setVolume, { volume });
  return { volume };
}

function* handleWatchPlayback() {
  let progressSimulator = yield fork(simulatePlayback);

  while (true) {
    const { cancellation } = yield race({
      listener: pollPlayback(),
      play: take(play.SUCCESS),
      pause: take(pause.SUCCESS),
      volume: take(setVolume.SUCCESS),
      cancellation: take(unwatchPlayback),
    });

    if (cancellation) {
      progressSimulator.cancel();
      return;
    }

    // Playback state returned by Spotify API might not reflect
    // actual state for a short time after it was altered. To prevent
    // getting outdated data we pause polling after every
    // play/pause/volume command for a few seconds.
    yield delay(PLAYBACK_POLL_COMMAND_COOLDOWN);
  }
}

function* pollPlayback() {
  let retries = 0;
  while (true) {
    let playbackState;
    try {
      playbackState = yield call(spotifyApi.player.getPlaybackState);
    } catch {
      const interval = 2 ** retries * PLAYBACK_POLL_RETRY_MIN_INTERVAL;
      yield delay(Math.min(interval, PLAYBACK_POLL_RETRY_MAX_INTERVAL));

      retries += 1;
      continue;
    }
    retries = 0;

    yield put(setPlaybackState(playbackState));
    yield delay(PLAYBACK_POLL_INTERVAL);
  }
}

function* simulatePlayback() {
  yield waitForPlaybackState({ isPlaying: true });

  const interval = PLAYBACK_SIMULATE_PROGRESS_INTERVAL;
  while (true) {
    const { paused } = yield race({
      progressIncreased: (function* () {
        yield delay(interval);
        yield put(increasePlaybackProgress({ value: interval }));
      })(),
      paused: waitForPlaybackState({ isPlaying: false }),
    });

    if (paused) {
      yield waitForPlaybackState({ isPlaying: true });
    }
  }
}

function* waitForPlaybackState({ isPlaying }) {
  while (true) {
    const { played, playbackStateSet } = yield race({
      played: take(play.SUCCESS),
      paused: take(pause.SUCCESS),
      playbackStateSet: take(setPlaybackState),
    });

    const actualIsPlaying = playbackStateSet
      ? playbackStateSet.payload.isPlaying
      : played != null;

    if (actualIsPlaying === isPlaying) {
      return true;
    }
  }
}

export default registerSagaHandlers([
  [startAuth, handleStartAuth],
  [completeAuth, handleCompleteAuth],
  [fetchCurrentUser, handleFetchCurrentUser],
  [fetchRecommendedPlaylists, handleFetchRecommendedPlaylists],
  [searchPlaylists, handleSearchPlaylists],
  [pause, handlePause],
  [play, handlePlay],
  [setVolume, handleSetVolume],
  [watchPlayback, handleWatchPlayback],
]);
