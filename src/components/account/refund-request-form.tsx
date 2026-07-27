"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitRefundRequest } from "@/app/actions/support/refunds";
import { Button } from "@/components/ui/button";
import type { RefundReason } from "@prisma/client";

const reasons: { value: RefundReason; label: string }[] = [
  { value: "NOT_WORKING", label: "Product not working" },
  { value: "WRONG_PRODUCT", label: "Purchased wrong product" },
  { value: "PAYMENT_ISSUE", label: "Payment issue" },
  { value: "OTHER", label: "Other" },
];

export function RefundRequestForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState<RefundReason>("NOT_WORKING");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await submitRefundRequest({ orderId, reason, description });
      router.push("/account/refunds");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="tech-label mb-2 block">Reason</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value as RefundReason)}
          className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
        >
          {reasons.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="tech-label mb-2 block">Description</label>
        <textarea
          required
          minLength={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
          placeholder="Describe the issue…"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" disabled={loading} className="rounded-none">
        {loading ? "Submitting…" : "Submit refund request"}
      </Button>
    </form>
  );
}
