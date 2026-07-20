import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {};

export default withSentryConfig(nextConfig, {
  org: "sentry-factory-ir",
  project: "sentry-factory",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
});
