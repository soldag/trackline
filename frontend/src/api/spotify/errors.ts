import { ApiError } from "@/api/utils/errors";
import { AppError, ErrorCode } from "@/types/errors";

export class SpotifyApiError extends ApiError {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(ErrorCode.Spotify, message);
    this.statusCode = statusCode;
  }

  serialize(): AppError {
    return {
      ...super.serialize(),
      extra: {
        statusCode: this.statusCode,
      },
    };
  }
}
