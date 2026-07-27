import type { Game, Cheat, GameSlug } from "@/types";
import { games } from "@/data/games";
import { cheats, getCheatsByGame } from "@/data/cheats";

export type GameWithProducts = Game & {
  productCount: number;
  startingPrice: number;
  cheats: Cheat[];
};

export type TierConfig = {
  label: string;
  subtitle: string;
  color: string;
  badgeClass: string;
  glowColor: string;
};

export const tierConfig: Record<string, TierConfig> = {
  xray: {
    label: "XRAY",
    subtitle: "CORE ESP",
    color: "#10b981",
    badgeClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    glowColor: "rgba(16,185,129,0.15)",
  },
  pro: {
    label: "PRO",
    subtitle: "AIM ASSIST",
    color: "#3b82f6",
    badgeClass: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    glowColor: "rgba(59,130,246,0.15)",
  },
  private: {
    label: "PRIVATE",
    subtitle: "FULL AIMBOT",
    color: "#8b5cf6",
    badgeClass: "bg-purple-500/10 border-purple-500/30 text-purple-400",
    glowColor: "rgba(139,92,246,0.15)",
  },
};

export function getStartingPrice(gameSlug: GameSlug): number {
  const gameProducts = cheats.filter((c) => c.game === gameSlug);
  const prices: number[] = [];
  for (const c of gameProducts) {
    if (c.price.monthly != null) prices.push(c.price.monthly);
    if (c.price.lifetime != null) prices.push(c.price.lifetime);
  }
  return prices.length > 0 ? Math.min(...prices) : 0;
}

export function getAllGamesWithProducts(): GameWithProducts[] {
  return games.map((game) => {
    const gameProducts = getCheatsByGame(game.slug as GameSlug);
    return {
      ...game,
      productCount: gameProducts.length,
      startingPrice: getStartingPrice(game.slug as GameSlug),
      cheats: gameProducts,
    };
  });
}

export function getGameWithProducts(slug: string): GameWithProducts | undefined {
  return getAllGamesWithProducts().find((g) => g.slug === slug);
}

export function getGameWithProductsByCheatsSlug(cheatsSlug: string): GameWithProducts | undefined {
  return getAllGamesWithProducts().find((g) => g.cheatsSlug === cheatsSlug);
}

/** All cheat products across all games, sorted by game then tier order. */
export function getAllCheatProducts(): Cheat[] {
  return cheats;
}

/** Tier display order (featured first) */
export const TIER_ORDER: Record<string, number> = { private: 0, pro: 1, xray: 2 };
