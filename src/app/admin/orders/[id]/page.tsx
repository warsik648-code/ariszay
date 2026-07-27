import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionRole } from "@/lib/auth-server";
import OrderStatusForm from "@/components/admin/order-status-form";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getSessionRole();

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true } },
          plan: { select: { label: true } },
        },
      },
      user: { select: { name: true, email: true } },
      payments: true,
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  const canEdit = role === "OWNER" || role === "ADMIN";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          ← Orders
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="text-xl font-bold text-white">
          Order #{order.id.slice(-8).toUpperCase()}
        </h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Order details */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
            Order details
          </h2>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/40">Status</dt>
              <dd className="font-medium text-white">{order.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/40">Payment</dt>
              <dd className="font-medium text-white">{order.paymentStatus}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/40">Total</dt>
              <dd className="font-bold text-white">${Number(order.totalAmount).toFixed(2)}</dd>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between">
                <dt className="text-white/40">Discount</dt>
                <dd className="text-emerald-400">-${Number(order.discountAmount).toFixed(2)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-white/40">Created</dt>
              <dd className="text-white/70">{order.createdAt.toLocaleString()}</dd>
            </div>
            {order.deliveredAt && (
              <div className="flex justify-between">
                <dt className="text-white/40">Delivered</dt>
                <dd className="text-emerald-400">{order.deliveredAt.toLocaleString()}</dd>
              </div>
            )}
            {order.couponCode && (
              <div className="flex justify-between">
                <dt className="text-white/40">Coupon</dt>
                <dd className="font-mono text-white/70">{order.couponCode}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Customer details */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
            Customer
          </h2>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/40">Name</dt>
              <dd className="text-white/70">{order.user?.name ?? order.guestName ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/40">Email</dt>
              <dd className="text-white/70">{order.user?.email ?? order.guestEmail ?? "—"}</dd>
            </div>
            {order.discordUsername && (
              <div className="flex justify-between">
                <dt className="text-white/40">Discord</dt>
                <dd className="text-white/70">{order.discordUsername}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
        <h2 className="mb-4 text-sm font-semibold text-white/70 uppercase tracking-wider">
          Items
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="pb-3 font-medium text-white/50">Product</th>
              <th className="pb-3 font-medium text-white/50">Plan</th>
              <th className="pb-3 text-right font-medium text-white/50">Price</th>
              <th className="pb-3 text-right font-medium text-white/50">Qty</th>
              <th className="pb-3 text-right font-medium text-white/50">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-white/5 last:border-0">
                <td className="py-3 text-white/80">{item.product.name}</td>
                <td className="py-3 text-white/50">{item.plan?.label ?? item.planLabel}</td>
                <td className="py-3 text-right text-white/70">${Number(item.unitPrice).toFixed(2)}</td>
                <td className="py-3 text-right text-white/70">{item.quantity}</td>
                <td className="py-3 text-right font-medium text-white">
                  ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admin actions */}
      {canEdit && (
        <OrderStatusForm
          orderId={order.id}
          currentStatus={order.status}
          currentPaymentStatus={order.paymentStatus}
          currentDeliveryStatus={order.deliveryStatus}
        />
      )}

      {/* Notes */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
          Notes
        </h2>
        {order.internalNote && (
          <div className="rounded-xl border border-white/8 bg-white/4 p-3">
            <p className="text-xs text-white/40 mb-1">Internal note</p>
            <p className="text-sm text-white/70">{order.internalNote}</p>
          </div>
        )}
        {order.customerNote && (
          <div className="rounded-xl border border-white/8 bg-white/4 p-3">
            <p className="text-xs text-white/40 mb-1">Customer note</p>
            <p className="text-sm text-white/70">{order.customerNote}</p>
          </div>
        )}
        {!order.internalNote && !order.customerNote && (
          <p className="text-sm text-white/30">No notes</p>
        )}
      </div>
    </div>
  );
}
