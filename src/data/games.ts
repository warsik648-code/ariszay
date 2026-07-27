import type { ComparisonRow, Game } from "@/types";

export const games: Game[] = [
  {
    slug: "isle",
    name: "The Isle",
    shortName: "Isle",
    description:
      "Dominate dinosaur survival with premium ESP, radar, and aim tools built for Evrima and Legacy.",
    tagline: "Survive. Hunt. Stay undetected.",
    accent: "#10b981",
  },
  {
    slug: "naraka",
    name: "Naraka: Bladepoint",
    shortName: "Naraka",
    description:
      "Competitive melee combat enhancements with stream-safe overlays and precision targeting.",
    tagline: "Win fights. Control the arena.",
    accent: "#ef4444",
  },
];

export function getGame(slug: string): Game | undefined {
  return games.find((game) => game.slug === slug);
}

export const comparisonMatrix: ComparisonRow[] = [
  { feature: "Player ESP", xray: true, pro: true, private: true },
  { feature: "Health / Distance ESP", xray: true, pro: true, private: true },
  { feature: "Loot Value ESP", xray: true, pro: true, private: true },
  { feature: "Aim Assist", xray: false, pro: true, private: true },
  { feature: "Trigger Assist", xray: false, pro: true, private: true },
  { feature: "Weapon / Threat ESP", xray: false, pro: true, private: true },
  { feature: "Enable Aimbot", xray: false, pro: false, private: true },
  {
    feature: "Drone / Companion Aimbot",
    xray: false,
    pro: false,
    private: true,
  },
  { feature: "2D Radar Hack", xray: false, pro: false, private: true },
  { feature: "Stream-Safe Mode", xray: false, pro: false, private: true },
  { feature: "Direct Support Channel", xray: false, pro: false, private: true },
];
