"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Game } from "@/types";

export function GameCard({
  game,
  viewLabel = "View Cheats",
}: {
  game: Game;
  viewLabel?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] p-6 transition-all duration-300",
        "hover:border-white/20 hover:shadow-xl hover:shadow-black/30",
      )}
      style={
        {
          "--game-accent": game.accent,
        } as React.CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
        style={{ background: game.accent }}
        aria-hidden
      />

      <div className="relative flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-xs tracking-[0.2em] text-white/40 uppercase">
            Featured Game
          </span>
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: game.accent }}
            aria-hidden
          />
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {game.name}
        </h3>

        <p className="text-sm leading-relaxed text-white/60">
          {game.description}
        </p>

        <p
          className="font-mono text-xs font-medium"
          style={{ color: game.accent }}
        >
          {game.tagline}
        </p>

        <div className="mt-auto flex items-center gap-3 pt-4">
          <Button asChild className="rounded-xl">
            <Link href={`/cheats/${game.cheatsSlug}`}>
              {viewLabel}
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-white/50 hover:text-white">
            <Link href={`/games/${game.slug}`}>Game info</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
