import { createAction } from "@reduxjs/toolkit";

import { PlaybackState, SpotifyAccessToken } from "@/types/spotify";

import { PREFIX } from "./constants";

interface SetAccessTokenPayload {
  token: SpotifyAccessToken;
}
export const setAccessToken = createAction<SetAccessTokenPayload>(
  `${PREFIX}/setAccessToken`,
);

export const invalidateAccessToken = createAction(
  `${PREFIX}/invalidateAccessToken`,
);

interface SetPlaybackStatePayload {
  playbackState: PlaybackState;
}
export const setPlaybackState = createAction<SetPlaybackStatePayload>(
  `${PREFIX}/setPlaybackState`,
);

interface IncreasePlaybackProgressPayload {
  value: number;
}
export const increasePlaybackProgress =
  createAction<IncreasePlaybackProgressPayload>(
    `${PREFIX}/increasePlaybackProgress`,
  );

export const clearPlaylistSearchResults = createAction(
  `${PREFIX}/clearPlaylistSearchResults`,
);

export const watchPlayback = createAction(`${PREFIX}/watchPlayback`);

export const unwatchPlayback = createAction(`${PREFIX}/unwatchPlayback`);
