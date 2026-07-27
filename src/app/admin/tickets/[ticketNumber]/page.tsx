import Link from "next/link";
import { notFound } from "next/navigation";
import type { UserRole } from "@prisma/client";

import { db } from "@/lib/db";
import { getSessionRole } from "@/lib/auth-server";
import { requireStaffPortal, roleHasCapability } from "@/lib/permissions";
import { formatMadridDate } from "@/lib/support/datetime";
import { ticketCategoryLabel, ticketStatusLabel } from "@/lib/support/labels";
import { AdminTicketControls } from "@/components/admin/admin-ticket-controls";
import { TicketThreadActions } from "@/components/account/ticket-thread-actions";

type PageProps = { params: Promise<{ ticketNumber: string }> };

export default async function AdminTicketDetailPage({ params }: PageProps) {
  await requireStaffPortal();
  const role = (await getSessionRole()) as UserRole;
  const { ticketNumber } = await params;

  const ticket = await db.ticket.findUnique({
    where: { ticketNumber },
    include: {
      user: { select: { id: true, email: true, name: true, createdAt: true } },
      order: {
        include: {
          items: true,
        },
      },
      assignedTo: { select: { id: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { name: true, email: true } },
          attachments: true,
        },
      },
      internalNotes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { email: true, name: true } } },
      },
      assignments: {
        orderBy: { createdAt: "desc" },
        include: {
          assignee: { select: { email: true } },
          assignedBy: { select: { email: true } },
        },
      },
    },
  });
  if (!ticket) notFound();

  const [customerTickets, staffUsers] = await Promise.all([
    db.ticket.findMany({
      where: { userId: ticket.userId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { ticketNumber: true, subject: true, status: true },
    }),
    db.user.findMany({
      where: {
        role: { in: ["OWNER", "ADMIN", "SUPPORT_MANAGER", "SUPPORT_AGENT"] },
      },
      select: { id: true, email: true, role: true },
      orderBy: { email: "asc" },
    }),
  ]);

  const canInternal = roleHasCapability(role, "tickets:internal_note");
  const canAssign = roleHasCapability(role, "tickets:assign");
  const canStatus = roleHasCapability(role, "tickets:status_any");
  const canReply = roleHasCapability(role, "tickets:reply_staff");

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/tickets" className="text-sm text-white/40 hover:text-white/70">
          ← Tickets
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="font-mono text-xl text-primary">{ticket.ticketNumber}</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
            <p className="text-xs font-mono uppercase tracking-wider text-white/40">
              {ticketCategoryLabel[ticket.category]} · {ticketStatusLabel[ticket.status]} · {ticket.priority}
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">{ticket.subject}</h2>
            <p className="mt-1 text-xs text-white/40">Created {formatMadridDate(ticket.createdAt)}</p>
          </div>

          <div className="space-y-3">
            {ticket.messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl border px-4 py-3 ${
                  m.isStaff ? "border-primary/20 bg-primary/5" : "border-white/10 bg-[#0d1117]"
                }`}
              >
                <div className="mb-2 flex justify-between text-xs text-white/40">
                  <span>{m.isStaff ? `Staff · ${m.author.email}` : m.author.email}</span>
                  <span>{formatMadridDate(m.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-white/80">{m.body}</p>
                {m.attachments.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {m.attachments.map((a) => (
                      <li key={a.id}>
                        <a href={`/api/support/attachments/${a.id}`} className="font-mono text-xs text-primary underline">
                          {a.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {canReply && (
            <TicketThreadActions ticketNumber={ticket.ticketNumber} status={ticket.status} />
          )}

          {canInternal && (
            <AdminTicketControls
              ticketNumber={ticket.ticketNumber}
              status={ticket.status}
              priority={ticket.priority}
              assignedToId={ticket.assignedToId}
              staffUsers={staffUsers}
              canAssign={canAssign}
              canStatus={canStatus}
              showInternalNote
            />
          )}

          {canInternal && ticket.internalNotes.length > 0 && (
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-yellow-400">
                Internal notes (staff only)
              </p>
              <ul className="space-y-3">
                {ticket.internalNotes.map((n) => (
                  <li key={n.id} className="text-sm text-white/70">
                    <p className="whitespace-pre-wrap">{n.body}</p>
                    <p className="mt-1 text-[10px] text-white/35">
                      {n.author.email} · {formatMadridDate(n.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <Panel title="Customer">
            <Link href={`/admin/customers/${ticket.user.id}`} className="text-primary hover:underline">
              {ticket.user.email}
            </Link>
            <p className="text-xs text-white/40">{ticket.user.name ?? "—"}</p>
          </Panel>

          {ticket.order && (
            <Panel title="Order">
              <Link href={`/admin/orders/${ticket.order.id}`} className="font-mono text-primary hover:underline">
                {ticket.order.orderNumber ?? ticket.order.id.slice(-8)}
              </Link>
              <p className="mt-1 text-xs text-white/40">
                Payment {ticket.order.paymentStatus} · {ticket.order.status}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-white/60">
                {ticket.order.items.map((i) => (
                  <li key={i.id}>
                    {i.productName}
                    {i.planLabel ? ` · ${i.planLabel}` : ""}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="Assignment">
            <p className="text-sm text-white/70">{ticket.assignedTo?.email ?? "Unassigned"}</p>
          </Panel>

          <Panel title="Customer ticket history">
            <ul className="space-y-2">
              {customerTickets.map((t) => (
                <li key={t.ticketNumber}>
                  <Link href={`/admin/tickets/${t.ticketNumber}`} className="font-mono text-xs text-primary hover:underline">
                    {t.ticketNumber}
                  </Link>
                  <p className="text-[10px] text-white/35">{ticketStatusLabel[t.status]}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-4">
      <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-white/40">{title}</p>
      {children}
    </div>
  );
}
