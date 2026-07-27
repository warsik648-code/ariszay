import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getServerSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { formatMadridDate } from "@/lib/support/datetime";
import {
  deliveryStatusLabel,
  refundStatusLabel,
  ticketStatusLabel,
} from "@/lib/support/labels";
import {
  orderStatusCustomerLabel,
  paymentStatusCustomerLabel,
} from "@/lib/payments/rewarble";
import { Button } from "@/components/ui/button";
import { RefundRequestForm } from "@/components/account/refund-request-form";
import { maskGiftCardCode } from "@/lib/payments/gift-card";

type PageProps = { params: Promise<{ orderNumber: string }> };

export default async function AccountOrderDetailPage({ params }: PageProps) {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const { orderNumber } = await params;
  const order = await db.order.findFirst({
    where: {
      userId: session.user.id,
      OR: [{ orderNumber }, { id: orderNumber }],
    },
    include: {
      items: true,
      tickets: { orderBy: { createdAt: "desc" } },
      refundRequests: { orderBy: { createdAt: "desc" } },
      paymentVerifications: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!order) notFound();

  const activeRefund = order.refundRequests.find((r) =>
    ["REQUESTED", "REVIEWING", "APPROVED"].includes(r.status),
  );
  const verification = order.paymentVerifications[0];

  return (
    <div className="space-y-8">
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-primary">
        <ArrowLeft className="size-4" /> Back to orders
      </Link>

      <div className="ind-panel p-6">
        <p className="tech-label mb-2">Order</p>
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-primary">
          {order.orderNumber ?? order.id.slice(-8).toUpperCase()}
        </h2>
        <p className="mt-2 text-sm text-white/45">Purchased {formatMadridDate(order.createdAt)}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Stat
            label="Payment"
            value={paymentStatusCustomerLabel(order.paymentStatus)}
            ok={order.paymentStatus === "PAID"}
            bad={order.paymentStatus === "FAILED"}
          />
          <Stat
            label="Order"
            value={orderStatusCustomerLabel(order.status, order.paymentStatus)}
            ok={order.status === "DELIVERED"}
          />
          <Stat label="Delivery" value={deliveryStatusLabel[order.deliveryStatus]} ok={order.deliveryStatus === "DELIVERED"} />
          <Stat label="Total" value={`$${Number(order.totalAmount).toFixed(2)}`} ok />
        </div>

        {verification && (
          <div className="mt-6 border border-white/10 bg-black/20 p-4 text-sm">
            <p className="tech-label mb-2">Payment method</p>
            <p className="text-white/80">Rewarble Visa Gift Card</p>
            <p className="mt-1 font-mono text-xs text-white/40">
              Code on file: {maskGiftCardCode(verification.giftCardLast4)}
            </p>
            {order.paymentStatus === "PENDING" && (
              <p className="mt-2 text-yellow-300/90">Your order is being reviewed.</p>
            )}
            {order.paymentStatus === "FAILED" && verification.rejectionReason && (
              <p className="mt-2 text-red-300/90">{verification.rejectionReason}</p>
            )}
          </div>
        )}
      </div>

      <section>
        <h3 className="mb-3 font-display text-lg font-bold uppercase">Products</h3>
        <ul className="space-y-2 border border-white/10 bg-[#111] p-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 text-sm">
              <span className="text-white/80">
                {item.productName}
                {item.planLabel ? ` · ${item.planLabel}` : ""}
              </span>
              <span className="font-mono text-white/50">
                ${Number(item.unitPrice).toFixed(2)} × {item.quantity}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-wrap gap-3">
        <Button asChild className="rounded-none">
          <Link href={`/account/tickets/new?orderId=${order.id}`}>Open support ticket</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-none border-white/15">
          <Link href="/account/tickets">View ticket history</Link>
        </Button>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-bold uppercase">Tickets</h3>
        {order.tickets.length === 0 ? (
          <p className="text-sm text-white/45">No tickets linked yet.</p>
        ) : (
          <ul className="space-y-2">
            {order.tickets.map((t) => (
              <li key={t.id}>
                <Link href={`/account/tickets/${t.ticketNumber}`} className="block border border-white/10 bg-[#111] px-4 py-3 hover:border-primary/30">
                  <span className="font-mono text-primary">{t.ticketNumber}</span>
                  <span className="ml-3 text-sm text-white/50">{ticketStatusLabel[t.status]}</span>
                  <p className="text-xs text-white/40">{t.subject}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="ind-panel p-6">
        <h3 className="mb-3 font-display text-lg font-bold uppercase">Request refund</h3>
        {activeRefund ? (
          <p className="text-sm text-white/60">
            Refund status: <span className="text-primary">{refundStatusLabel[activeRefund.status]}</span>
            {" · "}
            <Link href="/account/refunds" className="underline">Track progress</Link>
          </p>
        ) : (
          <RefundRequestForm orderId={order.id} />
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  ok,
  bad,
}: {
  label: string;
  value: string;
  ok?: boolean;
  bad?: boolean;
}) {
  return (
    <div className="border border-white/10 bg-black/30 p-3">
      <p className="tech-label mb-1">{label}</p>
      <p
        className={`font-mono text-sm ${
          bad ? "text-red-400" : ok ? "text-emerald-400" : "text-white/70"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
