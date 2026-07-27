import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getServerSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { formatMadridDate } from "@/lib/support/datetime";
import { ticketCategoryLabel, ticketStatusLabel } from "@/lib/support/labels";
import { TicketThreadActions } from "@/components/account/ticket-thread-actions";

type PageProps = { params: Promise<{ ticketNumber: string }> };

export default async function AccountTicketDetailPage({ params }: PageProps) {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const { ticketNumber } = await params;
  const ticket = await db.ticket.findFirst({
    where: { ticketNumber, userId: session.user.id },
    include: {
      order: { select: { orderNumber: true, id: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { name: true, email: true } },
          attachments: true,
        },
      },
    },
  });
  if (!ticket) notFound();

  return (
    <div className="space-y-6">
      <Link href="/account/tickets" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-primary">
        <ArrowLeft className="size-4" /> Tickets
      </Link>

      <div className="ind-panel p-6">
        <p className="tech-label mb-2">{ticketCategoryLabel[ticket.category]}</p>
        <h2 className="font-mono text-2xl text-primary">{ticket.ticketNumber}</h2>
        <p className="mt-2 text-lg text-white/80">{ticket.subject}</p>
        <p className="mt-2 text-xs text-white/40">
          {ticketStatusLabel[ticket.status]} · Created {formatMadridDate(ticket.createdAt)}
          {ticket.order?.orderNumber ? (
            <>
              {" · Order "}
              <Link href={`/account/orders/${ticket.order.orderNumber}`} className="text-primary underline">
                {ticket.order.orderNumber}
              </Link>
            </>
          ) : null}
        </p>
      </div>

      <div className="space-y-3">
        {ticket.messages.map((m) => (
          <div
            key={m.id}
            className={`border px-4 py-3 ${m.isStaff ? "border-primary/25 bg-[rgb(200_255_0_/_0.04)]" : "border-white/10 bg-[#111]"}`}
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/40">
              <span>{m.isStaff ? "Staff" : m.author.name ?? m.author.email}</span>
              <span>{formatMadridDate(m.createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-white/80">{m.body}</p>
            {m.attachments.length > 0 && (
              <ul className="mt-3 space-y-1">
                {m.attachments.map((a) => (
                  <li key={a.id}>
                    <a
                      href={`/api/support/attachments/${a.id}`}
                      className="font-mono text-xs text-primary underline"
                    >
                      {a.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <TicketThreadActions ticketNumber={ticket.ticketNumber} status={ticket.status} />
    </div>
  );
}
