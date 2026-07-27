import Link from "next/link";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      game: { select: { name: true } },
      plans: { select: { label: true, price: true, active: true } },
      _count: { select: { orderItems: true } },
    },
  });

  const statusColors: Record<string, string> = {
    AVAILABLE: "text-emerald-400",
    UPDATING: "text-yellow-400",
    UNAVAILABLE: "text-red-400",
    UNKNOWN: "text-white/40",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          Add product
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left bg-white/2">
              <th className="px-4 py-3 font-medium text-white/50">Name</th>
              <th className="px-4 py-3 font-medium text-white/50">Game</th>
              <th className="px-4 py-3 font-medium text-white/50">Status</th>
              <th className="px-4 py-3 font-medium text-white/50">Plans</th>
              <th className="px-4 py-3 font-medium text-white/50">Orders</th>
              <th className="px-4 py-3 font-medium text-white/50">Published</th>
              <th className="px-4 py-3 font-medium text-white/50">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white/30">
                  No products — run <code className="font-mono text-xs">pnpm db:seed</code> to seed initial data
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{product.name}</td>
                  <td className="px-4 py-3 text-white/50">{product.game?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${statusColors[product.status]}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50">{product.plans.length}</td>
                  <td className="px-4 py-3 text-white/50">{product._count.orderItems}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${product.published ? "text-emerald-400" : "text-white/30"}`}>
                      {product.published ? "Yes" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-xs text-white/40 hover:text-white transition-colors"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
