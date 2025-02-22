import { AppError, ErrorCode } from "@/types/errors";

export class ApiError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
  }

  serialize(): AppError {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

export class NetworkError extends ApiError {
  constructor(message: string) {
    super(ErrorCode.Network, message);
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string) {
    super(ErrorCode.Timeout, message);
  }
}
