import Link from "next/link";
import { redirect } from "next/navigation";
import { roleHasCapability } from "@/lib/permissions";
import { getSessionRole } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { formatMadridDate } from "@/lib/support/datetime";
import { maskGiftCardCode } from "@/lib/payments/gift-card";
import type { PaymentVerificationStatus } from "@prisma/client";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const role = await getSessionRole();
  if (!role || !roleHasCapability(role, "admin:access")) {
    redirect("/");
  }
  const { status: statusRaw } = await searchParams;
  const statusFilter =
    statusRaw === "PENDING" || statusRaw === "APPROVED" || statusRaw === "REJECTED"
      ? (statusRaw as PaymentVerificationStatus)
      : "PENDING";

  const rows = await db.paymentVerification.findMany({
    where: { status: statusFilter },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          guestEmail: true,
          guestName: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  const canVerify = roleHasCapability(role, "payments:verify");

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.22em] text-white/35 uppercase">
          Operations Center · Secure Terminal
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">Payment Verification</h1>
        <p className="mt-1 text-sm text-white/45">
          Rewarble Visa gift card queue. Codes are encrypted; full values are Owner/Admin only.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/payments?status=${s}`}
            className={`rounded-xl px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "border border-white/10 text-white/50 hover:text-white"
            }`}
          >
            {s === "PENDING" ? "Pending Verification" : s}
          </Link>
        ))}
      </div>

      {!canVerify && (
        <p className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-200/80">
          You can view the queue. Approve/reject requires Owner or Admin.
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.02] font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Discord</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Gift Card</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-white/40">
                  No {statusFilter.toLowerCase()} verifications.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const customer =
                  row.order.user?.email ||
                  row.order.guestEmail ||
                  row.order.user?.name ||
                  row.order.guestName ||
                  "—";
                return (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/payments/${row.id}`}
                        className="font-mono text-primary hover:underline"
                      >
                        {row.order.orderNumber ?? row.orderId.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white/70">{customer}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{row.discordUsername}</td>
                    <td className="px-4 py-3 text-white">${Number(row.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-white/50">Rewarble Visa</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/55">
                      {maskGiftCardCode(row.giftCardLast4)}
                    </td>
                    <td className="px-4 py-3 text-white/45">{formatMadridDate(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "APPROVED"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      : status === "REJECTED"
        ? "border-red-500/30 bg-red-500/10 text-red-400"
        : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
  return (
    <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-wider uppercase ${cls}`}>
      {status === "PENDING" ? "Pending Verification" : status}
    </span>
  );
}
