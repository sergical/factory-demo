"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center bg-white font-sans text-neutral-950 antialiased dark:bg-neutral-950 dark:text-white">
        <div className="px-4 text-center">
          <h1 className="text-xl font-semibold">Something went wrong.</h1>
          <p className="mt-2 text-base/7 text-neutral-600 sm:text-sm/6 dark:text-neutral-400">
            Try refreshing the page.
          </p>
        </div>
      </body>
    </html>
  );
}
