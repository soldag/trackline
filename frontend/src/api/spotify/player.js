import instance from "./instance";

export const getPlaybackState = async () => {
  const { data: playbackState } = await instance.get("me/player");

  const {
    isPlaying = false,
    progressMs: progress = null,
    item,
    device,
  } = playbackState || {};
  const { id: trackId = null, durationMs: duration = null } = item || {};
  const { volumePercent } = device || {};
  const isActive = !!playbackState;
  const volume = volumePercent != null ? volumePercent / 100 : null;

  return {
    isActive,
    isPlaying,
    trackId,
    progress,
    duration,
    volume,
  };
};

export const play = async ({ trackId, deviceId }) => {
  await instance.put("me/player/play", {
    ...(deviceId && { deviceId }),
    ...(trackId && { uris: [`spotify:track:${trackId}`] }),
  });
};

export const pause = async () => {
  await instance.put("me/player/pause");
};

export const setVolume = async ({ volume }) => {
  await instance.put("me/player/volume", null, {
    params: { volumePercent: Math.round(volume * 100) },
  });
};

export const setRepeatMode = async ({ state }) => {
  await instance.put("me/player/repeat", { state });
};
