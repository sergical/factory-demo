import * as Sentry from "@sentry/nextjs";
import { SENTRY_DSN } from "./lib/sentry";

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.consoleLoggingIntegration(),
  ],
  replaysSessionSampleRate: 1,
  replaysOnErrorSampleRate: 1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
