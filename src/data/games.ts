import type { ComparisonRow, Game } from "@/types";

export const games: Game[] = [
  {
    slug: "isle",
    cheatsSlug: "the-isle",
    name: "The Isle",
    shortName: "Isle",
    description:
      "Software tools for The Isle — covering both Evrima and Legacy builds. Check product pages for current availability before purchasing.",
    tagline: "Evrima & Legacy supported",
    accent: "#10b981",
  },
  {
    slug: "naraka",
    cheatsSlug: "naraka-bladepoint",
    name: "Naraka: Bladepoint",
    shortName: "Naraka",
    description:
      "Enhancement tools for Naraka: Bladepoint's competitive melee-combat environment. All products display a current availability status.",
    tagline: "Competitive enhancement tools",
    accent: "#6366f1",
  },
];

export function getGame(slug: string): Game | undefined {
  return games.find((game) => game.slug === slug);
}

export function getGameByCheatsSlug(cheatsSlug: string): Game | undefined {
  return games.find((game) => game.cheatsSlug === cheatsSlug);
}

export const comparisonMatrix: ComparisonRow[] = [
  { feature: "Player ESP", xray: true, pro: true, private: true },
  { feature: "Health / Distance ESP", xray: true, pro: true, private: true },
  { feature: "Loot Value ESP", xray: true, pro: true, private: true },
  { feature: "Aim Assist", xray: false, pro: true, private: true },
  { feature: "Trigger Assist", xray: false, pro: true, private: true },
  { feature: "Weapon / Threat ESP", xray: false, pro: true, private: true },
  { feature: "Aimbot", xray: false, pro: false, private: true },
  { feature: "Drone / Companion tools", xray: false, pro: false, private: true },
  { feature: "2D Radar", xray: false, pro: false, private: true },
  { feature: "Stream-Capture Exclusion", xray: false, pro: false, private: true },
  { feature: "Priority Support Channel", xray: false, pro: false, private: true },
];
