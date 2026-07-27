import type { ReactNode } from "react";

/**
 * Root layout required by Next.js. Actual chrome lives in `[locale]/layout`.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
