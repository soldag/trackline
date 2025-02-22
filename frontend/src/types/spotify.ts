export interface SpotifyAccessToken {
  accessToken: string;
  refreshToken: string;
}

interface Image {
  url: string;
  height?: number;
  width?: number;
}

export interface SpotifyUser {
  id: string;
  email: string;
  country: string;
}

export interface SpotifyTrack {
  id: string;
  durationMs: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  public: boolean;
  images: Image[];
  owner?: {
    id: string;
    displayName: string;
  };
  tracks: {
    total: number;
  };
}

type InactivePlaybackState = {
  isPlaying: false;
  trackId: null;
  progress: null;
  duration: null;
  volume: null;
};

type ActivePlaybackState = {
  isPlaying: boolean;
  trackId: string;
  progress: number;
  duration: number;
  volume: number;
};

export type PlaybackState =
  | ({ isActive: false } & InactivePlaybackState)
  | ({ isActive: true } & ActivePlaybackState);

export enum RepeatMode {
  Track = "track",
  Context = "context",
  Off = "off",
}
