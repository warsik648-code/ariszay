"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { replyToTicket, closeOrReopenTicket } from "@/app/actions/support/tickets";
import { Button } from "@/components/ui/button";

export function TicketThreadActions({
  ticketNumber,
  status,
}: {
  ticketNumber: string;
  status: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onReply(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await replyToTicket({
        ticketNumber,
        body,
        files: files ? Array.from(files) : [],
      });
      setBody("");
      setFiles(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function onToggle() {
    setLoading(true);
    try {
      await closeOrReopenTicket({
        ticketNumber,
        action: status === "CLOSED" ? "reopen" : "close",
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 border border-white/10 bg-[#111] p-4">
      {status !== "CLOSED" && (
        <form onSubmit={onReply} className="space-y-3">
          <textarea
            required
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full border border-white/15 bg-black/40 px-3 py-2 text-sm"
            placeholder="Write a reply…"
          />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="block w-full text-xs text-white/50"
          />
          <Button type="submit" disabled={loading} className="rounded-none">
            {loading ? "Sending…" : "Send reply"}
          </Button>
        </form>
      )}
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={onToggle}
        className="rounded-none border-white/15"
      >
        {status === "CLOSED" ? "Reopen ticket" : "Close ticket"}
      </Button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
