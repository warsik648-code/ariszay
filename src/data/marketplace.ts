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
    color: "#00e5ff",
    badgeClass: "border-[rgb(0_229_255_/_0.35)] bg-[rgb(0_229_255_/_0.08)] text-[#00e5ff]",
    glowColor: "rgba(0,229,255,0.12)",
  },
  pro: {
    label: "PRO",
    subtitle: "AIM ASSIST",
    color: "#c8ff00",
    badgeClass: "border-[rgb(200_255_0_/_0.35)] bg-[rgb(200_255_0_/_0.08)] text-[#c8ff00]",
    glowColor: "rgba(200,255,0,0.12)",
  },
  private: {
    label: "PRIVATE",
    subtitle: "FULL AIMBOT",
    color: "#ff5c00",
    badgeClass: "border-[rgb(255_92_0_/_0.4)] bg-[rgb(255_92_0_/_0.08)] text-[#ff5c00]",
    glowColor: "rgba(255,92,0,0.12)",
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
