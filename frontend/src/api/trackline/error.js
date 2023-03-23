class ApiError extends Error {
  code = "API_ERROR";

  constructor(message, statusCode = null, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors || [];
  }
}

export default ApiError;
