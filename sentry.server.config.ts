import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b245b47a3a2772b1fbdf80d31096b04d@o4511752378056704.ingest.us.sentry.io/4511752390705152",

  tracesSampleRate: 1.0,

  // Attach local variable values to stack frames
  includeLocalVariables: true,

  enableLogs: true,

  // Deliberately rich signal for the incident-response demo, but auth
  // material must never reach the shared Sentry org.
  sendDefaultPii: true,
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
