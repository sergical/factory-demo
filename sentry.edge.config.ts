import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b245b47a3a2772b1fbdf80d31096b04d@o4511752378056704.ingest.us.sentry.io/4511752390705152",

  tracesSampleRate: 1.0,

  enableLogs: true,
});
