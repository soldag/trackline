import * as Sentry from "@sentry/react";

import { SENTRY_DSN } from "@/configuration";

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
  });
}
