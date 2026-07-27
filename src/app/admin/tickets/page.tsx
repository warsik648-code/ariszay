import Link from "next/link";
import { db } from "@/lib/db";
import { requireStaffPortal } from "@/lib/permissions";
import { formatMadridDateShort } from "@/lib/support/datetime";
import { ticketCategoryLabel, ticketStatusLabel } from "@/lib/support/labels";
import type { TicketStatus } from "@prisma/client";

type Search = Promise<{
  status?: string;
  sort?: string;
  q?: string;
}>;

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  await requireStaffPortal();
  const sp = await searchParams;

  const status = sp.status as TicketStatus | undefined;
  const sort = sp.sort ?? "newest";

  const [counts, tickets] = await Promise.all([
    Promise.all([
      db.ticket.count({ where: { status: "NEW" } }),
      db.ticket.count({ where: { status: "OPEN" } }),
      db.ticket.count({ where: { status: { in: ["WAITING_CUSTOMER", "WAITING_STAFF"] } } }),
      db.ticket.count({ where: { category: "REFUND_REQUEST", status: { notIn: ["CLOSED", "RESOLVED"] } } }),
      db.ticket.count({ where: { status: "RESOLVED" } }),
    ]),
    db.ticket.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(sp.q
          ? {
              OR: [
                { ticketNumber: { contains: sp.q, mode: "insensitive" } },
                { subject: { contains: sp.q, mode: "insensitive" } },
                { user: { email: { contains: sp.q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      orderBy:
        sort === "oldest"
          ? { createdAt: "asc" }
          : sort === "priority"
            ? [{ priority: "desc" }, { createdAt: "desc" }]
            : sort === "status"
              ? [{ status: "asc" }, { createdAt: "desc" }]
              : { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { email: true, name: true } },
        order: { select: { orderNumber: true, paymentStatus: true } },
        assignedTo: { select: { email: true } },
      },
    }),
  ]);

  const [newCount, openCount, waitingCount, refundCount, resolvedCount] = counts;

  const filters: { label: string; href: string; count: number }[] = [
    { label: "All", href: "/admin/tickets", count: -1 },
    { label: "New", href: "/admin/tickets?status=NEW", count: newCount },
    { label: "Open", href: "/admin/tickets?status=OPEN", count: openCount },
    { label: "Waiting", href: "/admin/tickets?status=WAITING_STAFF", count: waitingCount },
    { label: "Resolved", href: "/admin/tickets?status=RESOLVED", count: resolvedCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-mono tracking-[0.25em] uppercase text-primary">Operations Center</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Support tickets</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {[
          { label: "New", value: newCount },
          { label: "Open", value: openCount },
          { label: "Waiting", value: waitingCount },
          { label: "Refund-linked", value: refundCount },
          { label: "Resolved", value: resolvedCount },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-[#0d1117] p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 hover:bg-white/5"
          >
            {f.label}
            {f.count >= 0 ? ` (${f.count})` : ""}
          </Link>
        ))}
        <Link href="/admin/tickets?sort=priority" className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 hover:bg-white/5">
          Sort: Priority
        </Link>
        <Link href="/admin/tickets?sort=oldest" className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 hover:bg-white/5">
          Sort: Oldest
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-left text-white/50">
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link href={`/admin/tickets/${t.ticketNumber}`} className="font-mono text-primary hover:underline">
                    {t.ticketNumber}
                  </Link>
                  <p className="text-xs text-white/40">{ticketCategoryLabel[t.category]}</p>
                </td>
                <td className="px-4 py-3 text-white/70">{t.user.email}</td>
                <td className="px-4 py-3 text-white/50">
                  {t.order?.orderNumber ?? "—"}
                  {t.order ? (
                    <span className="ml-2 text-[10px] text-white/30">{t.order.paymentStatus}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-white/60">{ticketStatusLabel[t.status]}</td>
                <td className="px-4 py-3 font-mono text-xs text-white/50">{t.priority}</td>
                <td className="px-4 py-3 text-white/40">{formatMadridDateShort(t.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
