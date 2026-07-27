import type { Metadata } from "next";

import { env } from "@/env";

export const siteConfig = {
  name: "ArisZay",
  tagline: "Premium Game Cheats & ESP",
  description:
    "Buy premium game cheats for The Isle and Naraka: Bladepoint — ESP, aim assist, and private aimbot tiers. Instant delivery, live status, and setup guides.",
  url: env.NEXT_PUBLIC_SITE_URL,
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
