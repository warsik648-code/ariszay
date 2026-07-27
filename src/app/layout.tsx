import type { ReactNode } from "react";

/**
 * Root layout — supplies <html> and <body> as required by Next.js 15.
 * Single English-only site; locale is hardcoded to "en".
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
