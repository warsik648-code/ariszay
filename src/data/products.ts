import type { Product } from "@/types";

/**
 * Utility / non-game product storefront.
 * Set to `true` to re-list Skin Changer, HWID Spoofer, UGC, Cloud DMA in nav,
 * homepage, sitemap, and `/products/[slug]`. Catalog + Prisma models stay intact.
 */
export const UTILITY_STOREFRONT_ENABLED = false;

/** Full utility catalog — kept for future expansion even when storefront is off. */
export const productCatalog: Product[] = [
  {
    slug: "ugc",
    name: "UGC",
    description: "Account recovery and unban tool builder.",
    longDescription:
      "UGC helps you recover locked accounts and rebuild access after restrictive bans with a guided, secure workflow.",
    price: { monthly: null, lifetime: 150 },
    icon: "shield",
    image: "/products/ugc.jpg",
    highlightFeatures: [
      "Account recovery workflows",
      "Unban tool builder",
      "Secure guided steps",
      "Status checks",
      "Priority support",
    ],
    featureCount: 12,
    systemRequirements: {
      os: "Windows 10/11",
      cpu: "Intel/AMD",
      ram: "4GB+",
      gpu: "Any",
      compatible: "Supported game accounts",
    },
  },
  {
    slug: "skin-changer",
    name: "Skin Changer",
    description: "Unlock all cosmetics instantly.",
    longDescription:
      "Preview and unlock cosmetic skins client-side for a premium look without grinding every unlock path.",
    price: { monthly: null, lifetime: 150 },
    icon: "palette",
    image: "/products/skin-changer.jpg",
    highlightFeatures: [
      "Unlock all cosmetics",
      "Instant preview",
      "Safe client-side apply",
      "Profile presets",
      "Easy reset",
    ],
    featureCount: 10,
    systemRequirements: {
      os: "Windows 10/11",
      cpu: "Intel/AMD",
      ram: "4GB+",
      gpu: "DirectX 11",
      compatible: "Supported titles",
    },
  },
  {
    slug: "cloud-dma",
    name: "Cloud DMA",
    description: "Single-PC cheat infrastructure.",
    longDescription:
      "Run advanced DMA-style tooling through a cloud bridge designed for a single-PC setup with low overhead.",
    price: { monthly: null, lifetime: 150 },
    icon: "cloud",
    image: "/products/cloud-dma.jpg",
    highlightFeatures: [
      "Single-PC method",
      "Cloud bridge",
      "Low overhead",
      "Setup guide included",
      "Lifetime license",
    ],
    featureCount: 14,
    systemRequirements: {
      os: "Windows 10/11",
      cpu: "Intel/AMD",
      ram: "8GB+",
      gpu: "DirectX 11",
      compatible: "Supported titles",
    },
  },
  {
    slug: "hwid-spoofer",
    name: "HWID Spoofer",
    description: "Hardware ID spoofing tool.",
    longDescription:
      "Reset and spoof hardware identifiers safely after a hardware ban so you can return to supported games.",
    price: { monthly: null, lifetime: 150 },
    icon: "cpu",
    image: "/products/hwid-spoofer.jpg",
    highlightFeatures: [
      "HWID reset",
      "Disk / SMBIOS spoof",
      "Clean temporary traces",
      "One-click restore",
      "Post-ban recovery guide",
    ],
    featureCount: 11,
    systemRequirements: {
      os: "Windows 10/11",
      cpu: "Intel/AMD",
      ram: "4GB+",
      gpu: "Any",
      compatible: "Most Windows games",
    },
  },
];

/** Storefront-visible utilities. Empty while `UTILITY_STOREFRONT_ENABLED` is false. */
export const products: Product[] = UTILITY_STOREFRONT_ENABLED
  ? productCatalog
  : [];

/** Resolve a utility product for the public storefront only. */
export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

/** Resolve from the full catalog (admin / future re-enable paths). */
export function getProductFromCatalog(slug: string): Product | undefined {
  return productCatalog.find((product) => product.slug === slug);
}

export const productFeatureLists: Record<Product["slug"], string[]> = {
  ugc: [
    "Guided account recovery",
    "Unban tool builder",
    "Status verification",
    "Secure credential handling",
    "Multi-step recovery checklist",
    "Export recovery report",
    "Priority ticket channel",
    "Compatibility checks",
    "Rollback safety",
    "Windows 10/11 support",
    "Quick-start PDF",
    "Lifetime updates",
  ],
  "skin-changer": [
    "Unlock all cosmetics",
    "Live preview",
    "Preset profiles",
    "One-click apply",
    "Safe reset",
    "Favorites list",
    "Seasonal packs",
    "Low CPU usage",
    "Offline mode",
    "Instant switch",
  ],
  "cloud-dma": [
    "Single-PC cloud bridge",
    "Encrypted session",
    "Auto reconnect",
    "Latency monitor",
    "Setup wizard",
    "Config sync",
    "Resource limits",
    "Session logs",
    "Lifetime license",
    "Priority support",
    "Windows compatibility",
    "Guide for Isle",
    "Guide for Naraka",
    "Update channel",
  ],
  "hwid-spoofer": [
    "Motherboard ID spoof",
    "Disk serial spoof",
    "MAC address tools",
    "Clean temp traces",
    "One-click restore",
    "Pre-check diagnostics",
    "Post-ban checklist",
    "Safe mode guidance",
    "Windows 10/11",
    "Quick reboot flow",
    "Lifetime updates",
  ],
};
