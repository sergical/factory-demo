import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {};

export default withSentryConfig(nextConfig, {
  org: "sentry-factory-ir",
  project: "sentry-factory",

  // Source map upload auth token (only needed for production builds)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload wider set of client source files for better stack trace resolution
  widenClientFileUpload: true,

  // Proxy API route so events bypass ad-blockers
  tunnelRoute: "/monitoring",

  silent: !process.env.CI,
});
