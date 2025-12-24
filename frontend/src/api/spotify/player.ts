import { PlaybackState, RepeatMode, SpotifyTrack } from "@/types/spotify";

import instance from "./instance";

interface ActivePlaybackStateResponse {
  isPlaying: boolean;
  progressMs: number;
  item: SpotifyTrack;
  device: {
    volumePercent: number;
  };
}
type PlaybackStateResponse = ActivePlaybackStateResponse | "";

export const getPlaybackState = async (): Promise<PlaybackState> => {
  const { data: playbackState } =
    await instance.get<PlaybackStateResponse>("me/player");

  if (!playbackState) {
    return {
      isActive: false,
      isPlaying: false,
      trackId: null,
      progress: null,
      duration: null,
      volume: null,
    };
  }

  const {
    isPlaying,
    progressMs: progress,
    item: { id: trackId, durationMs: duration },
    device: { volumePercent },
  } = playbackState;

  return {
    isActive: true,
    isPlaying,
    trackId,
    progress,
    duration,
    volume: volumePercent / 100,
  };
};

export const play = async ({
  trackId,
  deviceId,
}: {
  trackId?: string;
  deviceId?: string;
} = {}): Promise<void> => {
  await instance.put("me/player/play", {
    ...(deviceId && { deviceId }),
    ...(trackId && { uris: [`spotify:track:${trackId}`] }),
  });
};

export const pause = async (): Promise<void> => {
  await instance.put("me/player/pause");
};

export const setVolume = async (volume: number): Promise<void> => {
  await instance.put("me/player/volume", null, {
    params: { volumePercent: Math.round(volume * 100) },
  });
};

export const setRepeatMode = async (mode: RepeatMode): Promise<void> => {
  await instance.put("me/player/repeat", null, { params: { state: mode } });
};
