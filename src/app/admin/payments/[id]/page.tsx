import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getSessionRole } from "@/lib/auth-server";
import { roleHasCapability } from "@/lib/permissions";
import { formatMadridDate } from "@/lib/support/datetime";
import { maskGiftCardCode } from "@/lib/payments/gift-card";
import { PaymentReviewControls } from "@/components/admin/payment-review-controls";

export default async function AdminPaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const role = await getSessionRole();
  if (!role || !roleHasCapability(role, "admin:access")) {
    redirect("/");
  }
  const { id } = await params;

  const verification = await db.paymentVerification.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: true,
          user: { select: { id: true, email: true, name: true } },
        },
      },
      verifiedBy: { select: { email: true, name: true } },
    },
  });
  if (!verification) notFound();

  const canVerify = roleHasCapability(role, "payments:verify");
  const canViewCode = roleHasCapability(role, "payments:view_code");

  const audits = await db.auditLog.findMany({
    where: {
      targetType: "PaymentVerification",
      targetId: verification.id,
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const customer =
    verification.order.user?.email ||
    verification.order.guestEmail ||
    verification.order.user?.name ||
    verification.order.guestName ||
    "—";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/payments" className="text-sm text-white/40 hover:text-white/70">
          ← Payment queue
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="font-mono text-lg font-bold text-primary">
          {verification.order.orderNumber ?? verification.orderId.slice(-8).toUpperCase()}
        </h1>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-[rgb(200_255_0_/_0.04)] p-5">
        <p className="font-mono text-[10px] tracking-[0.22em] text-primary uppercase">
          Verification request · {verification.status}
        </p>
        <p className="mt-2 text-sm text-white/60">
          Order payment status:{" "}
          <span className="font-semibold text-white">{verification.order.paymentStatus}</span>
          {" · "}
          Order status:{" "}
          <span className="font-semibold text-white">{verification.order.status}</span>
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Request</h2>
          <dl className="space-y-2.5 text-sm">
            <Row label="Customer" value={customer} />
            <Row label="Discord" value={verification.discordUsername} mono />
            <Row label="Amount" value={`$${Number(verification.amount).toFixed(2)}`} />
            <Row label="Method" value="Rewarble Visa Gift Card" />
            <Row label="Gift card (masked)" value={maskGiftCardCode(verification.giftCardLast4)} mono />
            <Row label="Submitted" value={formatMadridDate(verification.createdAt)} />
            <Row label="IP" value={verification.ipAddress ?? "—"} mono />
            {verification.verifiedAt && (
              <Row
                label="Reviewed"
                value={`${formatMadridDate(verification.verifiedAt)} · ${
                  verification.verifiedBy?.email ?? "—"
                }`}
              />
            )}
            {verification.rejectionReason && (
              <Row label="Rejection" value={verification.rejectionReason} />
            )}
          </dl>
          <Link
            href={`/admin/orders/${verification.orderId}`}
            className="inline-block pt-2 text-sm text-primary hover:underline"
          >
            Open order record →
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Line items</h2>
          <ul className="space-y-2 text-sm">
            {verification.order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 text-white/70">
                <span>
                  {item.productName}
                  {item.planLabel ? ` · ${item.planLabel}` : ""}
                </span>
                <span className="font-mono text-white/45">
                  ${Number(item.unitPrice).toFixed(2)} × {item.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <PaymentReviewControls
        verificationId={verification.id}
        status={verification.status}
        canVerify={canVerify}
        canViewCode={canViewCode}
        initialNote={verification.internalNote ?? ""}
      />

      <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/70">
          Audit log
        </h2>
        {audits.length === 0 ? (
          <p className="text-sm text-white/40">No audit events yet.</p>
        ) : (
          <ul className="space-y-2">
            {audits.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/5 py-2 text-xs last:border-0"
              >
                <span className="font-mono text-primary">{a.action}</span>
                <span className="text-white/40">{formatMadridDate(a.createdAt)}</span>
                {a.ip && <span className="w-full font-mono text-white/30">ip {a.ip}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-white/40">{label}</dt>
      <dd className={`text-right text-white ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
