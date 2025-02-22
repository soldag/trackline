import { IntlShape, MessageDescriptor } from "react-intl";

import ApiErrorMessages from "@/translations/messages/ApiErrors";
import GlobalErrorMessages from "@/translations/messages/GlobalErrors";
import { AppError, ErrorCode } from "@/types/errors";

export const getErrorMessage = (intl: IntlShape, error: AppError) => {
  const { code, extra } = error;

  let messageDescriptor: MessageDescriptor | undefined;
  if (code === ErrorCode.Network) {
    messageDescriptor = GlobalErrorMessages.NETWORK_ERROR;
  } else if (code === ErrorCode.Timeout) {
    messageDescriptor = GlobalErrorMessages.TIMEOUT_ERROR;
  } else if (code === ErrorCode.TracklineApi) {
    const apiCode = extra?.apiError?.code;
    if (apiCode) {
      messageDescriptor = ApiErrorMessages[apiCode];
    }
  }

  return intl.formatMessage(
    messageDescriptor || GlobalErrorMessages.UNEXPECTED_ERROR,
  );
};
