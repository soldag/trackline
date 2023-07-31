import { ERROR_CODES } from "~/constants";
import ApiErrorMessages from "~/translations/messages/ApiErrors";
import GlobalErrorMessages from "~/translations/messages/GlobalErrors";

export const getErrorMessage = (intl, error) => {
  const { code, extra } = error;

  let messageDescriptor = null;

  if (code === ERROR_CODES.API) {
    const { apiError } = extra;
    messageDescriptor = ApiErrorMessages[apiError.code];
  }

  return intl.formatMessage(
    messageDescriptor || GlobalErrorMessages.UNEXPECTED_ERROR,
  );
};
