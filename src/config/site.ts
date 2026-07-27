import type { Metadata } from "next";

import { env } from "@/env";

export const siteConfig = {
  name: "ArisZay",
  tagline: "Premium Undetected Gaming Software",
  description:
    "26,000+ customers worldwide. Instant delivery. 24/7 support. Premium undetected gaming software for Isle, Naraka, and more.",
  url: env.NEXT_PUBLIC_SITE_URL,
  customersLabel: "26,000+",
} as const;

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};
