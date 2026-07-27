import { db } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { usages: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Coupons</h1>
        <Link
          href="/admin/coupons/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          Create coupon
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left bg-white/2">
              <th className="px-4 py-3 font-medium text-white/50">Code</th>
              <th className="px-4 py-3 font-medium text-white/50">Type</th>
              <th className="px-4 py-3 font-medium text-white/50">Value</th>
              <th className="px-4 py-3 font-medium text-white/50">Used</th>
              <th className="px-4 py-3 font-medium text-white/50">Limit</th>
              <th className="px-4 py-3 font-medium text-white/50">Expires</th>
              <th className="px-4 py-3 font-medium text-white/50">Active</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white/30">
                  No coupons yet
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-white">{coupon.code}</td>
                  <td className="px-4 py-3 text-white/50">{coupon.type}</td>
                  <td className="px-4 py-3 text-white/70">
                    {coupon.type === "PERCENTAGE"
                      ? `${Number(coupon.value)}%`
                      : `$${Number(coupon.value).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-white/50">{coupon.usageCount}</td>
                  <td className="px-4 py-3 text-white/50">{coupon.maxUsages ?? "∞"}</td>
                  <td className="px-4 py-3 text-white/40">
                    {coupon.expiresAt ? coupon.expiresAt.toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${coupon.active ? "text-emerald-400" : "text-white/30"}`}>
                      {coupon.active ? "Active" : "Inactive"}
                    </span>
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
