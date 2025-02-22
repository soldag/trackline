export interface EntityResponse<T> {
  status: "ok";
  data: T;
}

export interface ErrorDetail {
  message: string;
  location: string | null;
}

export interface Error {
  code: string;
  message: string;
  details: ErrorDetail[];
}

export interface ErrorResponse {
  status: "error";
  error: Error;
}
