"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/admin/orders";
import { Button } from "@/components/ui/button";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

type Props = {
  orderId: string;
  currentStatus: OrderStatus;
  currentPaymentStatus: PaymentStatus;
};

export default function OrderStatusForm({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateOrderStatus(formData);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-5"
    >
      <input type="hidden" name="orderId" value={orderId} />
      <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
        Update order
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Order status
          </label>
          <select
            name="status"
            defaultValue={currentStatus}
            className="h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white"
            disabled={isPending}
          >
            {(["PENDING", "PAID", "DELIVERED", "REFUNDED", "CANCELLED"] as OrderStatus[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Payment status
          </label>
          <select
            name="paymentStatus"
            defaultValue={currentPaymentStatus}
            className="h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white"
            disabled={isPending}
          >
            {(["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"] as PaymentStatus[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
          Internal note (not visible to customer)
        </label>
        <textarea
          name="internalNote"
          rows={2}
          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
          placeholder="Add an internal note…"
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
          Customer note (visible to customer)
        </label>
        <textarea
          name="customerNote"
          rows={2}
          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
          placeholder="Message visible to customer…"
          disabled={isPending}
        />
      </div>

      <Button type="submit" disabled={isPending} className="rounded-xl">
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
