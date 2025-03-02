import {
  TaskAbortError,
  createListenerMiddleware,
  isAnyOf,
} from "@reduxjs/toolkit";

import spotifyApi from "@/api/spotify";
import {
  PLAYBACK_POLL_COMMAND_COOLDOWN,
  PLAYBACK_POLL_INTERVAL,
  PLAYBACK_POLL_RETRY_MAX_INTERVAL,
  PLAYBACK_POLL_RETRY_MIN_INTERVAL,
  PLAYBACK_SIMULATE_PROGRESS_INTERVAL,
} from "@/constants";
import {
  increasePlaybackProgress,
  setPlaybackState,
  unwatchPlayback,
  watchPlayback,
} from "@/store/spotify/actions";
import { pause, play, setVolume } from "@/store/spotify/thunks";

const selectIsPlaying = (state) => state.spotify.playback.isPlaying;

const waitUntilVisible = async () => {
  if (!document.hidden) return;

  return new Promise((resolve) => {
    const handler = () => {
      if (!document.hidden) {
        document.removeEventListener("visibilitychange", handler);
        resolve();
      }
    };
    document.addEventListener("visibilitychange", handler);
  });
};

const middleware = createListenerMiddleware();

// Simulating progress while track is playing
middleware.startListening({
  predicate: (action, currState, prevState) => {
    const currIsPlaying = selectIsPlaying(currState);
    const prevIsPlaying = selectIsPlaying(prevState);
    const hasNewPlaybackState = setPlaybackState.match(action);

    return currIsPlaying !== prevIsPlaying || hasNewPlaybackState;
  },
  effect: async (_, listenerApi) => {
    listenerApi.cancelActiveListeners();

    if (selectIsPlaying(listenerApi.getState())) {
      while (true) {
        const startTime = Date.now();
        await listenerApi.delay(PLAYBACK_SIMULATE_PROGRESS_INTERVAL);
        await listenerApi.pause(waitUntilVisible());
        const value = Date.now() - startTime;

        listenerApi.dispatch(increasePlaybackProgress({ value }));
      }
    }
  },
});

// Watching playback state
middleware.startListening({
  actionCreator: watchPlayback,
  effect: async (_, listenerApi) => {
    listenerApi.unsubscribe();

    let retries = 0;
    while (true) {
      await listenerApi.pause(waitUntilVisible());

      let playbackState;
      try {
        playbackState = await listenerApi.pause(
          spotifyApi.player.getPlaybackState(),
        );
      } catch (e) {
        if (e instanceof TaskAbortError) throw e;

        const interval = 2 ** retries * PLAYBACK_POLL_RETRY_MIN_INTERVAL;
        await listenerApi.delay(
          Math.min(interval, PLAYBACK_POLL_RETRY_MAX_INTERVAL),
        );

        retries += 1;
        continue;
      }

      retries = 0;
      await listenerApi.dispatch(setPlaybackState(playbackState));

      const takeResult = await listenerApi.take(
        isAnyOf(
          unwatchPlayback,
          play.fulfilled,
          pause.fulfilled,
          setVolume.fulfilled,
        ),
        PLAYBACK_POLL_INTERVAL,
      );

      if (takeResult === null) {
        // This means a timeout has occurred, which means we have
        // waited for the poll interval and can continue as normal
        continue;
      }

      if (unwatchPlayback.match(takeResult[0])) {
        listenerApi.subscribe();
        return;
      }

      // Playback state returned by Spotify API might not reflect
      // actual state for a short time after it was altered. To prevent
      // getting outdated data we pause polling after every
      // play/pause/volume command for a few seconds.
      await listenerApi.delay(PLAYBACK_POLL_COMMAND_COOLDOWN);
    }
  },
});

export default middleware.middleware;
