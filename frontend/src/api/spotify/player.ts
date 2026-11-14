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

interface TrackResponse {
  album: {
    uri: string;
  };
}

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

const getAlbumUri = async (trackId: string): Promise<string> => {
  const { data } = await instance.get<TrackResponse>(`tracks/${trackId}`);
  return data.album.uri;
};

export const play = async ({
  trackId,
  deviceId,
}: {
  trackId?: string;
  deviceId?: string;
} = {}): Promise<void> => {
  const body: Record<string, unknown> = {};

  if (deviceId) {
    body.deviceId = deviceId;
  }

  if (trackId) {
    // WORKAROUND: Starting a single track via `uris` can leave the Spotify
    // client in a broken state: it acknowledges the request (204), but only
    // adds the track to the queue and restarts the current track instead.
    // Starting the track within its album context does not suffer from this
    // issue. To revert, remove the album lookup and set `body.uris` instead.
    body.contextUri = await getAlbumUri(trackId);
    body.offset = { uri: `spotify:track:${trackId}` };
  }

  await instance.put("me/player/play", body);
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
