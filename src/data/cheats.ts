import {
  featuresByTier,
  tierHighlightFeatures,
  tierPricing,
} from "@/data/features-by-tier";
import { getGame } from "@/data/games";
import type { Cheat, CheatTier, GameSlug } from "@/types";

const systemRequirementsByTier: Record<
  GameSlug,
  Record<CheatTier, Cheat["systemRequirements"]>
> = {
  isle: {
    xray: {
      os: "Windows 10 / 11 (64-bit)",
      cpu: "Intel or AMD CPU (any modern)",
      ram: "8 GB minimum",
      gpu: "DirectX 11 compatible GPU",
      compatible: "The Isle Evrima via Steam — Secure Boot OFF (or compatible mode)",
    },
    pro: {
      os: "Windows 10 / 11 (64-bit)",
      cpu: "Intel or AMD CPU (any modern)",
      ram: "8 GB minimum",
      gpu: "DirectX 11 compatible GPU",
      compatible: "The Isle Evrima via Steam — Secure Boot compatible mode",
    },
    private: {
      os: "Windows 10 / 11 (64-bit)",
      cpu: "Intel or AMD CPU (modern generation)",
      ram: "16 GB recommended",
      gpu: "DirectX 11 compatible GPU",
      compatible: "The Isle Evrima via Steam — active internet connection required",
    },
  },
  naraka: {
    xray: {
      os: "Windows 10/11 (64-bit)",
      cpu: "Intel Core i5 / AMD Ryzen 5 or better",
      ram: "8 GB+",
      gpu: "DirectX 11 compatible",
      compatible: "Naraka: Bladepoint (current build)",
    },
    pro: {
      os: "Windows 10/11 (64-bit)",
      cpu: "Intel Core i5 / AMD Ryzen 5 or better",
      ram: "8 GB+",
      gpu: "DirectX 11 compatible",
      compatible: "Naraka: Bladepoint (current build)",
    },
    private: {
      os: "Windows 10/11 (64-bit)",
      cpu: "Intel Core i5 / AMD Ryzen 5 or better",
      ram: "16 GB recommended",
      gpu: "DirectX 11 compatible",
      compatible: "Naraka: Bladepoint (current build) — active internet connection required",
    },
  },
};

const descriptions: Record<GameSlug, Record<CheatTier, string>> = {
  isle: {
    xray:
      "The Isle Evrima ESP hack — see dinosaurs and players through terrain, track health, distance, and loot with a lightweight external overlay.",
    pro:
      "The Isle aim assist cheat with full ESP. Includes Xray features plus aim assist, trigger bot, player filters, and multi-box ESP.",
    private:
      "The Isle private aimbot with radar and full ESP. Every Xray and Pro feature, plus aimbot hitbox control, drone ESP, 2D radar, and stream-safe mode.",
  },
  naraka: {
    xray:
      "Naraka: Bladepoint ESP hack — see players through walls, track distance and health, and read the fight before you engage.",
    pro:
      "Naraka aim assist cheat with full ESP. Includes aim help, trigger tools, player filters, and competitive awareness features.",
    private:
      "Naraka private aimbot with radar, full ESP, stream-safe mode, and advanced aim controls for every match.",
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
      name: `${game === "isle" ? "Isle" : "Naraka"} ${titleCase(tier)}`,
      description: descriptions[game][tier],
      price: {
        monthly: tierPricing[tier].monthly,
        lifetime: tierPricing[tier].lifetime,
      },
      status: "available" as const,
      highlightFeatures: tierHighlightFeatures[tier],
      featureCount: features.length,
      systemRequirements: systemRequirementsByTier[game][tier],
    };
  }),
);

export function getCheat(slug: string): Cheat | undefined {
  return cheats.find((cheat) => cheat.slug === slug);
}

export function getCheatByGameAndTier(
  game: GameSlug,
  tier: CheatTier,
): Cheat | undefined {
  return cheats.find((c) => c.game === game && c.tier === tier);
}

export function getCheatsByGame(game: GameSlug): Cheat[] {
  return cheats.filter((cheat) => cheat.game === game);
}

export function getFeaturesForCheat(cheat: Cheat): string[] {
  return featuresByTier[cheat.tier];
}

/** Build the public URL for a cheat detail page. */
export function getCheatUrl(cheat: Cheat): string {
  const game = getGame(cheat.game);
  return `/cheats/${game?.cheatsSlug ?? cheat.game}/${cheat.tier}`;
}
