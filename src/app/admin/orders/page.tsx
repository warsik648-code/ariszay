import Link from "next/link";
import { db } from "@/lib/db";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { formatMadridDateShort } from "@/lib/support/datetime";

type SearchParams = {
  status?: OrderStatus;
  payment?: PaymentStatus;
  q?: string;
  page?: string;
};

const PAGE_SIZE = 25;

const statusColors: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-500/10",
  PAID: "text-blue-400 bg-blue-500/10",
  DELIVERED: "text-emerald-400 bg-emerald-500/10",
  REFUNDED: "text-white/50 bg-white/5",
  CANCELLED: "text-red-400 bg-red-500/10",
};

const paymentColors: Record<string, string> = {
  UNPAID: "text-red-400 bg-red-500/10",
  PENDING: "text-yellow-400 bg-yellow-500/10",
  PAID: "text-emerald-400 bg-emerald-500/10",
  FAILED: "text-red-400 bg-red-500/10",
  REFUNDED: "text-white/40 bg-white/5",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(sp.status ? { status: sp.status } : {}),
    ...(sp.payment ? { paymentStatus: sp.payment } : {}),
    ...(sp.q
      ? {
          OR: [
            { id: { contains: sp.q, mode: "insensitive" as const } },
            { guestEmail: { contains: sp.q, mode: "insensitive" as const } },
            { user: { email: { contains: sp.q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        items: { include: { product: { select: { name: true } } }, take: 1 },
        user: { select: { email: true, name: true } },
      },
    }),
    db.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (params: Record<string, string | undefined>) => {
    const base = new URLSearchParams();
    const merged = { status: sp.status, payment: sp.payment, q: sp.q, ...params };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) base.set(k, v);
    });
    return `/admin/orders?${base.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <span className="text-sm text-white/40">{total} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <form className="flex-1 min-w-48">
          <input
            type="text"
            name="q"
            defaultValue={sp.q}
            placeholder="Search by ID or email…"
            className="h-9 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </form>
        <div className="flex gap-2">
          {(["PENDING", "PAID", "DELIVERED", "CANCELLED"] as OrderStatus[]).map(
            (status) => (
              <Link
                key={status}
                href={buildUrl({ status: sp.status === status ? undefined : status, page: "1" })}
                className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                  sp.status === status
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/10 text-white/40 hover:text-white"
                }`}
              >
                {status}
              </Link>
            ),
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left bg-white/2">
                <th className="px-4 py-3 font-medium text-white/50">Order</th>
                <th className="px-4 py-3 font-medium text-white/50">Customer</th>
                <th className="px-4 py-3 font-medium text-white/50">Product</th>
                <th className="px-4 py-3 font-medium text-white/50">Total</th>
                <th className="px-4 py-3 font-medium text-white/50">Status</th>
                <th className="px-4 py-3 font-medium text-white/50">Payment</th>
                <th className="px-4 py-3 font-medium text-white/50">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-white/30">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-xs font-medium text-white/70 hover:text-white transition-colors"
                      >
                        #{order.id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {order.user?.email ?? order.guestEmail ?? "Guest"}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {order.items[0]?.product.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      ${Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColors[order.status] ?? ""
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          paymentColors[order.paymentStatus] ?? ""
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40">
                      {formatMadridDateShort(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              ← Prev
            </Link>
          )}
          <span className="text-sm text-white/40">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
