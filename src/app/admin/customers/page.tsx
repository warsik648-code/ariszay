import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const PAGE_SIZE = 25;

  const where = sp.q
    ? {
        role: "CUSTOMER" as const,
        OR: [
          { email: { contains: sp.q, mode: "insensitive" as const } },
          { name: { contains: sp.q, mode: "insensitive" as const } },
        ],
      }
    : { role: "CUSTOMER" as const };

  const [customers, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        _count: { select: { orders: true } },
        orders: {
          select: { totalAmount: true, paymentStatus: true },
          where: { paymentStatus: "PAID" },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <span className="text-sm text-white/40">{total} total</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left bg-white/2">
              <th className="px-4 py-3 font-medium text-white/50">Email</th>
              <th className="px-4 py-3 font-medium text-white/50">Name</th>
              <th className="px-4 py-3 font-medium text-white/50">Orders</th>
              <th className="px-4 py-3 font-medium text-white/50">Total spent</th>
              <th className="px-4 py-3 font-medium text-white/50">Joined</th>
              <th className="px-4 py-3 font-medium text-white/50">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const totalSpent = customer.orders.reduce(
                (sum, o) => sum + Number(o.totalAmount),
                0,
              );
              return (
                <tr
                  key={customer.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      {customer.email}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white/50">{customer.name ?? "—"}</td>
                  <td className="px-4 py-3 text-white/50">{customer._count.orders}</td>
                  <td className="px-4 py-3 text-white/70">${totalSpent.toFixed(2)}</td>
                  <td className="px-4 py-3 text-white/40">
                    {customer.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium ${
                        customer.banned ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {customer.banned ? "Banned" : "Active"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
