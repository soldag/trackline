import { defineMessages } from "react-intl";

export default defineMessages({
  NETWORK_ERROR: {
    id: "GlobalErrors.networkError",
    defaultMessage:
      "Oops, something went wrong! It seems like there's a problem with your network connection.",
  },
  TIMEOUT_ERROR: {
    id: "GlobalErrors.timeoutError",
    defaultMessage:
      "Oops, something went wrong! The server took too long to respond.",
  },
  UNEXPECTED_ERROR: {
    id: "GlobalErrors.unexpectedError",
    defaultMessage: "An unexpected error occurred.",
  },
});
