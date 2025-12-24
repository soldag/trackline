import spotifyApi from "@/api/spotify";
import tracklineApi from "@/api/trackline";
import { RECOMMENDED_PLAYLIST_IDS } from "@/constants";
import { createSafeAsyncThunk } from "@/store/utils/thunks";
import { RepeatMode } from "@/types/spotify";
import invariant from "@/utils/invariant";

import { setAccessToken } from "./actions";
import { PREFIX } from "./constants";

export const startAuth = createSafeAsyncThunk(PREFIX, "startAuth", async () => {
  window.location.href = spotifyApi.auth.getAuthorizeUrl();
});

interface CompleteAuthPayload {
  code: string;
}
export const completeAuth = createSafeAsyncThunk(
  PREFIX,
  "completeAuth",
  async ({ code }: CompleteAuthPayload, { dispatch }) => {
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

interface SearchPlaylistsPayload {
  query: string;
  limit: number;
}
export const searchPlaylists = createSafeAsyncThunk(
  PREFIX,
  "searchPlaylists",
  async ({ query, limit }: SearchPlaylistsPayload, { getState }) => {
    const userId = getState().spotify.user?.id;
    invariant(userId);

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

interface PlayPayload {
  trackId?: string;
}
export const play = createSafeAsyncThunk(
  PREFIX,
  "play",
  async ({ trackId }: PlayPayload | undefined = {}) => {
    await spotifyApi.player.play({ trackId });
    await spotifyApi.player.setRepeatMode(RepeatMode.Track);
    return { trackId };
  },
);

interface SetVolumePayload {
  volume: number;
}
export const setVolume = createSafeAsyncThunk(
  PREFIX,
  "setVolume",
  async ({ volume }: SetVolumePayload) => {
    await spotifyApi.player.setVolume(volume);
    return { volume };
  },
);
