import { ERROR_CODES } from "@/constants";
import ApiErrorMessages from "@/translations/messages/ApiErrors";
import GlobalErrorMessages from "@/translations/messages/GlobalErrors";

export class NetworkError extends Error {
  code = ERROR_CODES.NETWORK;
}

export class TimeoutError extends Error {
  code = ERROR_CODES.TIMEOUT;
}

export const getErrorMessage = (intl, error) => {
  const { code, extra } = error;

  let messageDescriptor = null;
  if (code === ERROR_CODES.NETWORK) {
    messageDescriptor = GlobalErrorMessages.NETWORK_ERROR;
  } else if (code === ERROR_CODES.TIMEOUT) {
    messageDescriptor = GlobalErrorMessages.TIMEOUT_ERROR;
  } else if (code === ERROR_CODES.API) {
    const { apiError } = extra;
    messageDescriptor = ApiErrorMessages[apiError.code];
  }

  return intl.formatMessage(
    messageDescriptor || GlobalErrorMessages.UNEXPECTED_ERROR,
  );
};
