import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { formatMadridDateShort } from "@/lib/support/datetime";
import {
  deliveryStatusLabel,
  refundStatusLabel,
  statusChipClass,
} from "@/lib/support/labels";

export default async function AccountOrdersPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      refundRequests: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="tech-label mb-2">My Orders</p>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-[#f2f0eb]">
          Purchase history
        </h2>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-white/50">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto border border-[rgb(242_240_235_/_0.1)]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 bg-[#0d0d0d] font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Refund</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const refund = order.refundRequests[0];
                const href = `/account/orders/${order.orderNumber ?? order.id}`;
                return (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <Link href={href} className="font-mono text-primary hover:underline">
                        {order.orderNumber ?? order.id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white/50">{formatMadridDateShort(order.createdAt)}</td>
                    <td className="px-4 py-3 text-white/70">
                      {order.items.map((i) => (
                        <div key={i.id}>
                          {i.productName}
                          {i.planLabel ? ` · ${i.planLabel}` : ""}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-white">${Number(order.totalAmount).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Chip text={order.paymentStatus} kind={order.paymentStatus === "PAID" ? "ok" : "warn"} />
                    </td>
                    <td className="px-4 py-3">
                      <Chip text={order.status} kind={order.status === "DELIVERED" ? "ok" : "info"} />
                    </td>
                    <td className="px-4 py-3">
                      <Chip text={deliveryStatusLabel[order.deliveryStatus]} kind={order.deliveryStatus === "DELIVERED" ? "ok" : "muted"} />
                    </td>
                    <td className="px-4 py-3 text-white/50">
                      {refund ? refundStatusLabel[refund.status] : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Chip({ text, kind }: { text: string; kind: "ok" | "warn" | "bad" | "info" | "muted" }) {
  return (
    <span className={`inline-flex border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase ${statusChipClass(kind)}`}>
      {text}
    </span>
  );
}
