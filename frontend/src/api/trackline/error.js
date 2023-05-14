import { ERROR_CODES } from "constants";

class ApiError extends Error {
  code = ERROR_CODES.API;

  constructor(message, statusCode = null, apiError = null) {
    super(message);
    this.statusCode = statusCode;
    this.apiError = apiError;
  }
}

export default ApiError;
