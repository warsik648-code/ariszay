import {
  featuresByTier,
  tierHighlightFeatures,
  tierPricing,
} from "@/data/features-by-tier";
import type { Cheat, CheatTier, GameSlug } from "@/types";

const systemRequirementsByGame: Record<GameSlug, Cheat["systemRequirements"]> =
  {
    isle: {
      os: "Windows 10/11",
      cpu: "Intel/AMD",
      ram: "8GB+",
      gpu: "DirectX 11",
      compatible: "The Isle Evrima / Legacy",
    },
    naraka: {
      os: "Windows 10/11",
      cpu: "Intel/AMD",
      ram: "8GB+",
      gpu: "DirectX 11",
      compatible: "Naraka: Bladepoint (latest)",
    },
  };

const descriptions: Record<GameSlug, Record<CheatTier, string>> = {
  isle: {
    xray: "Essential visibility suite for The Isle — track players, loot, and distance with a clean overlay.",
    pro: "Competitive edge for Isle survivors with aim assist, threat filters, and advanced ESP.",
    private:
      "Premium enhancement suite for The Isle dinosaur survival with aimbot, radar, and stream-safe tools.",
  },
  naraka: {
    xray: "Clarity-focused overlays for Naraka — see opponents, health, and positioning at a glance.",
    pro: "Ranked-ready Naraka toolkit with aim assist, trigger tools, and hostile filters.",
    private:
      "Full private suite for Naraka: Bladepoint — aimbot, radar, and exclusive support channel.",
  },
};

const tiers: CheatTier[] = ["xray", "pro", "private"];
const gameSlugs: GameSlug[] = ["isle", "naraka"];

function titleCase(tier: CheatTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export const cheats: Cheat[] = gameSlugs.flatMap((game) =>
  tiers.map((tier) => {
    const features = featuresByTier[tier];
    return {
      slug: `${game}-${tier}`,
      game,
      tier,
      name: `${game === "isle" ? "Isle" : "Naraka"} ${titleCase(tier)} Cheat`,
      description: descriptions[game][tier],
      price: {
        monthly: tierPricing[tier].monthly,
        lifetime: tierPricing[tier].lifetime,
      },
      status: "undetected",
      rating: tier === "private" ? 4.9 : tier === "pro" ? 4.8 : 4.7,
      reviewCount: tier === "private" ? 127 : tier === "pro" ? 98 : 64,
      highlightFeatures: tierHighlightFeatures[tier],
      featureCount: features.length,
      systemRequirements: systemRequirementsByGame[game],
    };
  }),
);

export function getCheat(slug: string): Cheat | undefined {
  return cheats.find((cheat) => cheat.slug === slug);
}

export function getCheatsByGame(game: GameSlug): Cheat[] {
  return cheats.filter((cheat) => cheat.game === game);
}

export function getFeaturesForCheat(cheat: Cheat): string[] {
  return featuresByTier[cheat.tier];
}
