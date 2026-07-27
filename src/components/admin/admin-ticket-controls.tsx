"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TicketPriority, TicketStatus } from "@prisma/client";
import {
  staffAddInternalNote,
  staffUpdateTicket,
} from "@/app/actions/support/tickets";
import { Button } from "@/components/ui/button";

export function AdminTicketControls({
  ticketNumber,
  status,
  priority,
  assignedToId,
  staffUsers,
  canAssign,
  canStatus,
  showInternalNote,
}: {
  ticketNumber: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedToId: string | null;
  staffUsers: { id: string; email: string; role: string }[];
  canAssign: boolean;
  canStatus: boolean;
  showInternalNote: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0d1117] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Staff controls</p>

      {(canStatus || canAssign) && (
        <form
          className="grid gap-3 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            start(async () => {
              try {
                await staffUpdateTicket({
                  ticketNumber,
                  status: (fd.get("status") as TicketStatus) || undefined,
                  priority: (fd.get("priority") as TicketPriority) || undefined,
                  assigneeId: canAssign ? String(fd.get("assigneeId") || "") || undefined : undefined,
                });
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed");
              }
            });
          }}
        >
          {canStatus && (
            <>
              <select name="status" defaultValue={status} className="h-10 border border-white/10 bg-black/20 px-2 text-sm">
                {(["NEW", "OPEN", "WAITING_CUSTOMER", "WAITING_STAFF", "RESOLVED", "CLOSED"] as TicketStatus[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select name="priority" defaultValue={priority} className="h-10 border border-white/10 bg-black/20 px-2 text-sm">
                {(["LOW", "NORMAL", "HIGH", "URGENT"] as TicketPriority[]).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </>
          )}
          {canAssign && (
            <select name="assigneeId" defaultValue={assignedToId ?? ""} className="h-10 border border-white/10 bg-black/20 px-2 text-sm">
              <option value="">Unassigned</option>
              {staffUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.email} ({u.role})</option>
              ))}
            </select>
          )}
          <Button type="submit" disabled={pending} className="rounded-xl sm:col-span-3">
            Update ticket
          </Button>
        </form>
      )}

      {showInternalNote && (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              try {
                await staffAddInternalNote({ ticketNumber, body: note });
                setNote("");
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed");
              }
            });
          }}
        >
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            required
            placeholder="Internal note (never visible to customer)"
            className="w-full border border-yellow-500/20 bg-black/20 px-3 py-2 text-sm"
          />
          <Button type="submit" variant="outline" disabled={pending} className="rounded-xl border-yellow-500/30">
            Add internal note
          </Button>
        </form>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
