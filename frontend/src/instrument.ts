import * as Sentry from "@sentry/react";

import { NetworkError } from "@/api/utils/errors";
import { SENTRY_DSN } from "@/configuration";

const SENSITIVE_KEYS = ["forwarded", "-ip", "remote-", "via", "-user"];

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: {
        request: { deny: SENSITIVE_KEYS },
        response: { deny: SENSITIVE_KEYS },
      },
      httpBodies: [],
      urlQueryParams: { deny: SENSITIVE_KEYS },
    },
    beforeSend: (event, hint) =>
      hint.originalException instanceof NetworkError ? null : event,
  });
}
