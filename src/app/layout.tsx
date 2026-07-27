import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";

/**
 * Root layout — supplies <html> and <body> as required by Next.js 15.
 * Uses next-intl's getLocale() so the lang attribute is always correct.
 * Font variables and providers are applied in [locale]/layout.tsx.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
