import * as Sentry from "@sentry/nextjs";
import { SENTRY_DSN } from "./src/lib/sentry";

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1,
  enableLogs: true,
  // Deliberately rich signal for the incident-response demo, but auth
  // material must never reach the shared Sentry org.
  sendDefaultPii: true,
  integrations: [Sentry.consoleLoggingIntegration()],
  beforeSend(event) {
    if (event.request) {
      delete event.request.cookies;
      if (event.request.headers) {
        delete event.request.headers.cookie;
        delete event.request.headers.authorization;
      }
    }
    return event;
  },
});
