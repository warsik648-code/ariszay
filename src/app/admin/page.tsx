import { db } from "@/lib/db";
import {
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  Package,
} from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders,
    pendingOrders,
    paidOrders,
    deliveredOrders,
    totalRevenue,
    revenueToday,
    revenueWeek,
    revenueMonth,
    totalCustomers,
    recentOrders,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "PAID" } }),
    db.order.count({ where: { status: "DELIVERED" } }),
    db.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID" } }),
    db.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: "PAID", createdAt: { gte: startOfDay } },
    }),
    db.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: "PAID", createdAt: { gte: startOfWeek } },
    }),
    db.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: "PAID", createdAt: { gte: startOfMonth } },
    }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        items: {
          include: { product: { select: { name: true } } },
          take: 1,
        },
      },
    }),
  ]);

  return {
    totalOrders,
    pendingOrders,
    paidOrders,
    deliveredOrders,
    totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0),
    revenueToday: Number(revenueToday._sum.totalAmount ?? 0),
    revenueWeek: Number(revenueWeek._sum.totalAmount ?? 0),
    revenueMonth: Number(revenueMonth._sum.totalAmount ?? 0),
    totalCustomers,
    recentOrders,
  };
}

const statusColors: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-500/10",
  PAID: "text-blue-400 bg-blue-500/10",
  DELIVERED: "text-emerald-400 bg-emerald-500/10",
  REFUNDED: "text-white/50 bg-white/5",
  CANCELLED: "text-red-400 bg-red-500/10",
};

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const statCards = [
    {
      label: "Total revenue",
      value: `$${data.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      sub: `$${data.revenueMonth.toFixed(2)} this month`,
    },
    {
      label: "Total orders",
      value: data.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      sub: `${data.pendingOrders} pending`,
    },
    {
      label: "Customers",
      value: data.totalCustomers.toLocaleString(),
      icon: Users,
      sub: "Registered accounts",
    },
    {
      label: "Delivered",
      value: data.deliveredOrders.toLocaleString(),
      icon: CheckCircle,
      sub: `${data.paidOrders} paid, awaiting delivery`,
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* Revenue summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Today", value: data.revenueToday },
          { label: "This week", value: data.revenueWeek },
          { label: "This month", value: data.revenueMonth },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-[#0d1117] p-4">
            <p className="text-xs text-white/40">{label}</p>
            <p className="mt-1 text-xl font-bold text-white">${value.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, sub }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-[#0d1117] p-5"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-white/50">{label}</p>
              <Icon className="size-4 text-white/30" />
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-white/30">{sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pending orders", count: data.pendingOrders, href: "/admin/orders?status=PENDING", icon: Clock, color: "text-yellow-400" },
          { label: "Manage products", count: null, href: "/admin/products", icon: Package, color: "text-white/50" },
          { label: "View customers", count: data.totalCustomers, href: "/admin/customers", icon: Users, color: "text-white/50" },
        ].map(({ label, count, href, icon: Icon, color }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0d1117] p-4 transition-colors hover:border-white/20"
          >
            <Icon className={`size-5 shrink-0 ${color}`} />
            <div>
              <p className="text-sm font-medium text-white">{label}</p>
              {count !== null && (
                <p className="text-xs text-white/40">{count} total</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 font-medium text-white/50">Order</th>
                <th className="px-4 py-3 font-medium text-white/50">Product</th>
                <th className="px-4 py-3 font-medium text-white/50">Total</th>
                <th className="px-4 py-3 font-medium text-white/50">Status</th>
                <th className="px-4 py-3 font-medium text-white/50">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white/30">
                    No orders yet
                  </td>
                </tr>
              ) : (
                data.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/2"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-xs text-white/70 hover:text-white transition-colors"
                      >
                        #{order.id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {order.items[0]?.product.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      ${Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColors[order.status] ?? "text-white/50"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40">
                      {order.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
