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
    const SENSITIVE = /password|token|secret|api[-_]?key|authorization|cookie/i;
    if (event.request) {
      // The login route's body is the moderator password
      if (event.request.url?.includes("/api/mod/")) {
        delete event.request.data;
      }
      delete event.request.cookies;
      for (const name of Object.keys(event.request.headers ?? {})) {
        if (SENSITIVE.test(name)) delete event.request.headers?.[name];
      }
    }
    // includeLocalVariables can capture credentials held in locals
    for (const exception of event.exception?.values ?? []) {
      for (const frame of exception.stacktrace?.frames ?? []) {
        for (const key of Object.keys(frame.vars ?? {})) {
          if (SENSITIVE.test(key) && frame.vars) {
            frame.vars[key] = "[Filtered]";
          }
        }
      }
    }
    return event;
  },
});
