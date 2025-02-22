import { Error as TracklineApiError } from "@/api/trackline/types";

export enum ErrorCode {
  Network = "NETWORK_ERROR",
  Timeout = "TIMEOUT_ERROR",
  TracklineApi = "TRACKLINE_API_ERROR",
  Spotify = "SPOTIFY_ERROR",
  Unexpected = "UNEXPECTED_ERROR",
}

export interface AppError {
  code: ErrorCode;
  message: string;
  extra?: {
    apiError?: TracklineApiError;
    statusCode?: number;
  };
}
