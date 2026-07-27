import Link from "next/link";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";

export default async function AdminGamesPage() {
  const games = await db.game.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true, faqs: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Games</h1>
        <Link
          href="/admin/games/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          Add game
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {games.length === 0 ? (
          <p className="text-white/30 col-span-2">
            No games found. Run <code className="font-mono text-xs">pnpm db:seed</code> to seed initial data.
          </p>
        ) : (
          games.map((game) => (
            <div
              key={game.id}
              className="rounded-2xl border border-white/10 bg-[#0d1117] p-5"
              style={{ borderLeftColor: game.accent, borderLeftWidth: 4 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{game.name}</h2>
                  <p className="mt-0.5 text-xs text-white/40">/{game.cheatsSlug}</p>
                </div>
                <Link
                  href={`/admin/games/${game.id}/edit`}
                  className="text-xs text-white/40 hover:text-white transition-colors"
                >
                  Edit →
                </Link>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{game.description}</p>
              <div className="mt-3 flex gap-4 text-xs text-white/30">
                <span>{game._count.products} products</span>
                <span>{game._count.faqs} FAQs</span>
                <span className={game.published ? "text-emerald-400" : "text-red-400"}>
                  {game.published ? "Published" : "Unpublished"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
