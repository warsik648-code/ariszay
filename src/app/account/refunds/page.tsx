import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { formatMadridDateShort } from "@/lib/support/datetime";
import { refundReasonLabel, refundStatusLabel } from "@/lib/support/labels";

export default async function AccountRefundsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const refunds = await db.refundRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { orderNumber: true } },
      ticket: { select: { ticketNumber: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="tech-label mb-2">Refunds</p>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-[#f2f0eb]">
          Refund tracking
        </h2>
      </div>

      {refunds.length === 0 ? (
        <p className="text-sm text-white/50">No refund requests.</p>
      ) : (
        <div className="space-y-3">
          {refunds.map((r) => (
            <div key={r.id} className="border border-white/10 bg-[#111] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/account/orders/${r.order.orderNumber ?? r.orderId}`}
                  className="font-mono text-primary hover:underline"
                >
                  {r.order.orderNumber ?? r.orderId.slice(-8)}
                </Link>
                <span className="font-mono text-xs text-yellow-400">{refundStatusLabel[r.status]}</span>
              </div>
              <p className="mt-2 text-sm text-white/70">{refundReasonLabel[r.reason]}</p>
              <p className="mt-1 text-xs text-white/40">{formatMadridDateShort(r.createdAt)}</p>
              {r.ticket && (
                <Link href={`/account/tickets/${r.ticket.ticketNumber}`} className="mt-2 inline-block text-xs text-primary underline">
                  {r.ticket.ticketNumber}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
