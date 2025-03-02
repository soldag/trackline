import { createAction } from "@reduxjs/toolkit";

import { PREFIX } from "./constants";

export const setAccessToken = createAction(`${PREFIX}/setAccessToken`);

export const invalidateAccessToken = createAction(
  `${PREFIX}/invalidateAccessToken`,
);

export const setPlaybackState = createAction(`${PREFIX}/setPlaybackState`);

export const increasePlaybackProgress = createAction(
  `${PREFIX}/increasePlaybackProgress`,
);

export const clearPlaylistSearchResults = createAction(
  `${PREFIX}/clearPlaylistSearchResults`,
);

export const watchPlayback = createAction(`${PREFIX}/watchPlayback`);

export const unwatchPlayback = createAction(`${PREFIX}/unwatchPlayback`);
