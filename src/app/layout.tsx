import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { defaultMetadata } from "@/config/site";

import "./globals.css";

const fontSans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const fontMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata = defaultMetadata;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} min-h-svh font-sans antialiased`}
        suppressHydrationWarning
      >
        <SiteHeader />
        <main className="min-h-[70vh]">{children}</main>
        <SiteFooter />
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
