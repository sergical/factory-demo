import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Handraise",
  description: "Live audience Q&A for Incident Review with Factory & Sentry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body className="isolate flex min-h-full flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
        {children}
      </body>
    </html>
  );
}
