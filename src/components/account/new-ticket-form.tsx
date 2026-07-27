"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TicketCategory } from "@prisma/client";
import { createCustomerTicket } from "@/app/actions/support/tickets";
import { Button } from "@/components/ui/button";

const categories: { value: TicketCategory; label: string }[] = [
  { value: "ORDER_SUPPORT", label: "Order Support" },
  { value: "PAYMENT_ISSUE", label: "Payment Issue" },
  { value: "REFUND_REQUEST", label: "Refund Request" },
  { value: "TECHNICAL_ISSUE", label: "Technical Issue" },
  { value: "ACCOUNT_ISSUE", label: "Account Issue" },
  { value: "OTHER", label: "Other" },
];

export function NewTicketForm({
  orders,
  defaultOrderId,
}: {
  orders: { id: string; label: string }[];
  defaultOrderId?: string;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<TicketCategory>("ORDER_SUPPORT");
  const [orderId, setOrderId] = useState(defaultOrderId ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await createCustomerTicket({
        category,
        subject,
        body,
        orderId: orderId || undefined,
      });
      router.push(`/account/tickets/${result.ticketNumber}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 ind-panel p-6">
      <Field label="Category">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TicketCategory)}
          className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Linked order (optional)">
        <select
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm"
        >
          <option value="">None</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Subject">
        <input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Message">
        <textarea
          required
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm"
        />
      </Field>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" disabled={loading} className="rounded-none">
        {loading ? "Creating…" : "Create ticket"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="tech-label mb-2 block">{label}</label>
      {children}
    </div>
  );
}
