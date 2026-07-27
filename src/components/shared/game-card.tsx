"use client";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { Link } from "@/i18n/navigation";
import type { Game } from "@/types";

export function GameCard({
  game,
  viewLabel = "View Cheats",
}: {
  game: Game;
  viewLabel?: string;
}) {
  return (
    <GlassCard
      className="relative overflow-hidden"
      style={{
        boxShadow: `0 0 0 1px ${game.accent}33, 0 20px 50px rgb(0 0 0 / 0.35)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at top right, ${game.accent}55, transparent 55%)`,
        }}
      />
      <div className="relative flex h-full flex-col gap-4">
        <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
          Featured game
        </p>
        <h3 className="text-3xl font-bold">{game.name}</h3>
        <p className="text-muted-foreground text-sm">{game.description}</p>
        <p className="text-primary font-mono text-xs">{game.tagline}</p>
        <div className="mt-auto pt-4">
          <Button asChild className="rounded-xl">
            <Link href={`/games/${game.slug}`}>{viewLabel}</Link>
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
