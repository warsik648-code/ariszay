import type { Metadata } from "next";

import { env } from "@/env";

export const siteConfig = {
  name: "ArisZay",
  tagline: "Gaming Enhancement Software",
  description:
    "Enhancement software for The Isle and Naraka: Bladepoint. Clear product status, instant delivery, and written setup guides included.",
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
