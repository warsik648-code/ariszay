import { db } from "@/lib/db";

async function nextSequence(name: "order" | "ticket"): Promise<number> {
  const row = await db.sequenceCounter.upsert({
    where: { name },
    create: { name, value: 10000 },
    update: { value: { increment: 1 } },
  });
  return row.value;
}

export async function nextOrderNumber(): Promise<string> {
  const n = await nextSequence("order");
  return `AZ-${n}`;
}

export async function nextTicketNumber(): Promise<string> {
  const n = await nextSequence("ticket");
  return `SUP-${n}`;
}

/** Ensure counters sit above any existing human numbers (e.g. after backfill). */
export async function syncSequenceFromExisting() {
  const [orders, tickets] = await Promise.all([
    db.order.findMany({
      where: { orderNumber: { not: null } },
      select: { orderNumber: true },
    }),
    db.ticket.findMany({ select: { ticketNumber: true } }),
  ]);

  let maxOrder = 9999;
  for (const o of orders) {
    const m = o.orderNumber?.match(/^AZ-(\d+)$/);
    if (m) maxOrder = Math.max(maxOrder, Number(m[1]));
  }
  let maxTicket = 9999;
  for (const t of tickets) {
    const m = t.ticketNumber.match(/^SUP-(\d+)$/);
    if (m) maxTicket = Math.max(maxTicket, Number(m[1]));
  }

  await db.sequenceCounter.upsert({
    where: { name: "order" },
    create: { name: "order", value: maxOrder },
    update: { value: Math.max(maxOrder, 9999) },
  });
  // Re-read and set properly
  await db.sequenceCounter.update({
    where: { name: "order" },
    data: { value: maxOrder },
  });
  await db.sequenceCounter.upsert({
    where: { name: "ticket" },
    create: { name: "ticket", value: maxTicket },
    update: { value: maxTicket },
  });
}
