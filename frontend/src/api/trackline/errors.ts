import { Error } from "@/api/trackline/types";
import { ApiError } from "@/api/utils/errors";
import { AppError, ErrorCode } from "@/types/errors";

export class TracklineApiError extends ApiError {
  statusCode?: number;
  errorObject?: Error;

  constructor(message: string, statusCode?: number, errorObject?: Error) {
    super(ErrorCode.TracklineApi, message);
    this.statusCode = statusCode;
    this.errorObject = errorObject;
  }

  serialize(): AppError {
    return {
      ...super.serialize(),
      extra: {
        apiError: this.errorObject,
        statusCode: this.statusCode,
      },
    };
  }
}
