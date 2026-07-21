import * as Sentry from "@sentry/react";

import { NetworkError } from "@/api/utils/errors";
import { SENTRY_DSN } from "@/configuration";

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    beforeSend: (event, hint) =>
      hint.originalException instanceof NetworkError ? null : event,
  });
}
