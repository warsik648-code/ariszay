"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  revealGiftCardCode,
  reviewPaymentVerification,
  updatePaymentInternalNote,
} from "@/app/actions/admin/payments";

export function PaymentReviewControls({
  verificationId,
  status,
  canVerify,
  canViewCode,
  initialNote,
}: {
  verificationId: string;
  status: string;
  canVerify: boolean;
  canViewCode: boolean;
  initialNote: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote);
  const [rejectionReason, setRejectionReason] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function saveNote() {
    startTransition(async () => {
      setError("");
      const res = await updatePaymentInternalNote({ verificationId, internalNote: note });
      if (!res.success) setError(res.error);
      else router.refresh();
    });
  }

  function reveal() {
    startTransition(async () => {
      setError("");
      const res = await revealGiftCardCode(verificationId);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setRevealed(res.code);
    });
  }

  function review(action: "approve" | "reject") {
    startTransition(async () => {
      setError("");
      const res = await reviewPaymentVerification({
        verificationId,
        action,
        internalNote: note || undefined,
        rejectionReason: action === "reject" ? rejectionReason || undefined : undefined,
      });
      if (!res.success) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {canViewCode && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-amber-300/80">
            Secure code vault
          </p>
          <p className="text-sm text-white/60">
            Full gift card codes are encrypted at rest. Viewing is logged in the audit trail.
          </p>
          {revealed ? (
            <div className="flex flex-wrap items-center gap-3">
              <code className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 font-mono text-sm text-primary">
                {revealed}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-xl"
                onClick={() => setRevealed(null)}
              >
                <EyeOff className="mr-1.5 size-3.5" /> Hide
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-amber-500/30"
              disabled={pending}
              onClick={reveal}
            >
              <Eye className="mr-1.5 size-3.5" /> Reveal full code
            </Button>
          )}
        </div>
      )}

      {!canViewCode && (
        <p className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/45">
          Full gift card codes are restricted to Owner/Admin. Support roles only see the masked code.
        </p>
      )}

      {canVerify && (
        <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            Internal notes
          </h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            placeholder="Ops notes (not visible to customer)"
            disabled={pending}
          />
          <Button type="button" variant="outline" size="sm" className="rounded-xl" disabled={pending} onClick={saveNote}>
            Save note
          </Button>

          {status === "PENDING" && (
            <>
              <div className="space-y-1.5 pt-2">
                <label className="text-xs text-white/50">Rejection reason (if rejecting)</label>
                <input
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white"
                  placeholder="Invalid / already used / amount mismatch…"
                  disabled={pending}
                />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  type="button"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500"
                  disabled={pending}
                  onClick={() => review("approve")}
                >
                  <Check className="mr-1.5 size-4" /> Approve — mark Paid
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-red-500/40 text-red-300 hover:bg-red-500/10"
                  disabled={pending}
                  onClick={() => review("reject")}
                >
                  <X className="mr-1.5 size-4" /> Reject — Payment Failed
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
