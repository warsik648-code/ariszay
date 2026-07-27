import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionRole } from "@/lib/auth-server";
import { roleHasCapability } from "@/lib/permissions";
import { formatMadridDateShort } from "@/lib/support/datetime";
import { refundReasonLabel, refundStatusLabel } from "@/lib/support/labels";
import { staffReviewRefund } from "@/app/actions/support/refunds";
import { Button } from "@/components/ui/button";

export default async function AdminRefundsPage() {
  const role = await getSessionRole();
  if (!role || !roleHasCapability(role, "refunds:review")) {
    redirect("/admin");
  }

  const refunds = await db.refundRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { email: true } },
      order: { select: { id: true, orderNumber: true, totalAmount: true } },
      ticket: { select: { ticketNumber: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-mono tracking-[0.25em] uppercase text-primary">Operations Center</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Refund requests</h1>
      </div>

      <div className="space-y-4">
        {refunds.length === 0 ? (
          <p className="text-sm text-white/40">No refund requests.</p>
        ) : (
          refunds.map((r) => (
            <div key={r.id} className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/admin/orders/${r.order.id}`} className="font-mono text-primary hover:underline">
                    {r.order.orderNumber ?? r.order.id.slice(-8)}
                  </Link>
                  <p className="mt-1 text-sm text-white/60">{r.user.email}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {refundReasonLabel[r.reason]} · ${Number(r.order.totalAmount).toFixed(2)} ·{" "}
                    {formatMadridDateShort(r.createdAt)}
                  </p>
                  {r.ticket && (
                    <Link href={`/admin/tickets/${r.ticket.ticketNumber}`} className="mt-2 inline-block text-xs text-primary underline">
                      {r.ticket.ticketNumber}
                    </Link>
                  )}
                </div>
                <span className="font-mono text-xs text-yellow-400">{refundStatusLabel[r.status]}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">{r.description}</p>

              <form action={staffReviewRefund} className="mt-4 flex flex-wrap items-end gap-2">
                <input type="hidden" name="refundId" value={r.id} />
                <select name="status" defaultValue={r.status === "REQUESTED" ? "REVIEWING" : r.status} className="h-10 border border-white/10 bg-black/20 px-2 text-sm">
                  <option value="REVIEWING">Reviewing</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <input
                  name="reviewNote"
                  placeholder="Review note"
                  className="h-10 min-w-[180px] flex-1 border border-white/10 bg-black/20 px-3 text-sm"
                />
                <Button type="submit" className="rounded-xl">Update</Button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
