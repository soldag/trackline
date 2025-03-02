import spotifyApi from "@/api/spotify";
import tracklineApi from "@/api/trackline";
import { RECOMMENDED_PLAYLIST_IDS } from "@/constants";
import { createSafeAsyncThunk } from "@/store/utils/thunks";

import { setAccessToken } from "./actions";
import { PREFIX } from "./constants";

export const startAuth = createSafeAsyncThunk(PREFIX, "startAuth", async () => {
  window.location = spotifyApi.auth.getAuthorizeUrl();
});

export const completeAuth = createSafeAsyncThunk(
  PREFIX,
  "completeAuth",
  async ({ code }, { dispatch }) => {
    const accessToken = await tracklineApi.spotify.getAccessToken({
      code,
    });
    dispatch(setAccessToken({ token: accessToken }));

    const user = await spotifyApi.users.getMe();
    return { user };
  },
);

export const fetchCurrentUser = createSafeAsyncThunk(
  PREFIX,
  "fetchCurrentUser",
  async () => {
    const user = await spotifyApi.users.getMe();
    return { user };
  },
);

export const fetchRecommendedPlaylists = createSafeAsyncThunk(
  PREFIX,
  "fetchRecommendedPlaylists",
  async () => {
    const results = await Promise.allSettled(
      RECOMMENDED_PLAYLIST_IDS.map((id) => spotifyApi.playlists.get({ id })),
    );
    const errors = results.filter(
      (r) => r.status === "rejected" && r.reason?.statusCode !== 404,
    );
    if (errors.length > 0) {
      throw errors[0];
    }

    const playlists = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);
    return { playlists };
  },
);

export const searchPlaylists = createSafeAsyncThunk(
  PREFIX,
  "searchPlaylists",
  async ({ query, limit }, { getState }) => {
    const userId = getState().spotify.user?.id;
    const playlists = await spotifyApi.playlists.search({
      userId,
      query,
      limit,
    });

    return { playlists };
  },
);

export const pause = createSafeAsyncThunk(PREFIX, "pause", async () => {
  await spotifyApi.player.pause();
});

export const play = createSafeAsyncThunk(
  PREFIX,
  "play",
  async ({ trackId } = {}) => {
    await spotifyApi.player.play({ trackId });
    return { trackId };
  },
);

export const setVolume = createSafeAsyncThunk(
  PREFIX,
  "setVolume",
  async ({ volume }) => {
    await spotifyApi.player.setVolume({ volume });
    return { volume };
  },
);
