import { AxiosInstance } from "axios";
import * as rax from "retry-axios";

import {
  HTTP_RETRY_MAX_ATTEMPTS,
  HTTP_RETRY_MAX_INTERVAL,
  HTTP_RETRY_MIN_INTERVAL,
} from "@/constants";

/**
 * Adds automatic retries with exponential backoff for transient failures
 * (network errors, timeouts and 5XX responses) of idempotent requests.
 *
 * Must be applied at creation time, i.e. *before* any interceptor that
 * transforms errors into custom error types, so it can inspect the raw Axios
 * error (which still carries the request `config` needed to re-issue the
 * request).
 */
export const withRetry = <T extends AxiosInstance>(instance: T): T => {
  instance.defaults.raxConfig = {
    backoffType: "exponential",
    retry: HTTP_RETRY_MAX_ATTEMPTS,
    retryDelay: HTTP_RETRY_MIN_INTERVAL,
    maxRetryDelay: HTTP_RETRY_MAX_INTERVAL,
    statusCodesToRetry: [[500, 599]],
    checkRetryAfter: false,
  };

  rax.attach(instance);
  return instance;
};
