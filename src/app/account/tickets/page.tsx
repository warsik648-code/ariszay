import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { formatMadridDateShort } from "@/lib/support/datetime";
import { ticketCategoryLabel, ticketStatusLabel } from "@/lib/support/labels";
import { Button } from "@/components/ui/button";

export default async function AccountTicketsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const tickets = await db.ticket.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { order: { select: { orderNumber: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="tech-label mb-2">Support</p>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-[#f2f0eb]">
            Tickets
          </h2>
        </div>
        <Button asChild className="rounded-none">
          <Link href="/account/tickets/new">New ticket</Link>
        </Button>
      </div>

      {tickets.length === 0 ? (
        <p className="text-sm text-white/50">No tickets yet.</p>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/account/tickets/${t.ticketNumber}`}
              className="ind-panel-hover block border border-white/10 bg-[#111] px-4 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-primary">{t.ticketNumber}</p>
                <p className="text-xs text-white/45">{ticketStatusLabel[t.status]}</p>
              </div>
              <p className="mt-1 text-sm text-white/80">{t.subject}</p>
              <p className="mt-1 text-xs text-white/40">
                {ticketCategoryLabel[t.category]}
                {t.order?.orderNumber ? ` · ${t.order.orderNumber}` : ""}
                {" · "}
                {formatMadridDateShort(t.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
