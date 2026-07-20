import * as Sentry from "@sentry/nextjs";
import { SENTRY_DSN } from "./src/lib/sentry";

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,
  integrations: [Sentry.consoleLoggingIntegration()],
});
