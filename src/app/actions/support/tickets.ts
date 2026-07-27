"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";
import { db } from "@/lib/db";
import {
  assertOwnsOrder,
  assertTicketAccess,
  requireCapability,
  requireSession,
  writeAuditLog,
} from "@/lib/permissions";
import {
  addInternalNote,
  addTicketReply,
  assignTicket,
  createManualTicket,
  setTicketStatus,
} from "@/lib/support/tickets";
import { saveTicketUpload } from "@/lib/support/uploads";

const categoryEnum = z.enum([
  "ORDER_SUPPORT",
  "PAYMENT_ISSUE",
  "REFUND_REQUEST",
  "TECHNICAL_ISSUE",
  "ACCOUNT_ISSUE",
  "OTHER",
]);

export async function createCustomerTicket(input: {
  category: TicketCategory;
  subject: string;
  body: string;
  orderId?: string;
}) {
  const session = await requireSession();
  const parsed = z
    .object({
      category: categoryEnum,
      subject: z.string().min(3).max(200),
      body: z.string().min(5).max(10000),
      orderId: z.string().cuid().optional(),
    })
    .safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  if (parsed.data.orderId) {
    await assertOwnsOrder(session.user.id, parsed.data.orderId);
  }

  const ticket = await createManualTicket({
    userId: session.user.id,
    ...parsed.data,
  });

  revalidatePath("/account/tickets");
  revalidatePath("/admin/tickets");
  return { ticketNumber: ticket.ticketNumber };
}

export async function replyToTicket(input: {
  ticketNumber: string;
  body: string;
  files?: File[];
}) {
  const session = await requireSession();
  const role = ((session.user as { role?: string }).role ?? "CUSTOMER") as
    | "CUSTOMER"
    | "OWNER"
    | "ADMIN"
    | "SUPPORT_AGENT"
    | "SUPPORT_MANAGER"
    | "CONTENT_MANAGER"
    | "ANALYST";

  const parsed = z
    .object({
      ticketNumber: z.string().min(3),
      body: z.string().min(1).max(10000),
    })
    .safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  const isStaff = role !== "CUSTOMER";
  const ticket = await assertTicketAccess({
    ticketNumber: parsed.data.ticketNumber,
    userId: session.user.id,
    role,
    forReply: isStaff,
  });

  if (isStaff) {
    await requireCapability("tickets:reply_staff");
  }

  const message = await addTicketReply({
    ticketId: ticket.id,
    authorId: session.user.id,
    body: parsed.data.body,
    isStaff,
  });

  const files = input.files?.slice(0, 5) ?? [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const saved = await saveTicketUpload(ticket.id, file);
    await db.ticketAttachment.create({
      data: {
        ticketId: ticket.id,
        messageId: message.id,
        uploadedById: session.user.id,
        fileName: saved.fileName,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        storageKey: saved.storageKey,
      },
    });
  }

  await writeAuditLog({
    actorId: session.user.id,
    action: isStaff ? "ticket.staff_reply" : "ticket.customer_reply",
    targetType: "Ticket",
    targetId: ticket.id,
  });

  revalidatePath(`/account/tickets/${ticket.ticketNumber}`);
  revalidatePath(`/admin/tickets/${ticket.ticketNumber}`);
  revalidatePath("/account/tickets");
  revalidatePath("/admin/tickets");
}

export async function closeOrReopenTicket(input: {
  ticketNumber: string;
  action: "close" | "reopen";
}) {
  const session = await requireSession();
  const role = ((session.user as { role?: string }).role ?? "CUSTOMER") as
    | "CUSTOMER"
    | "OWNER"
    | "ADMIN"
    | "SUPPORT_AGENT"
    | "SUPPORT_MANAGER"
    | "CONTENT_MANAGER"
    | "ANALYST";

  const ticket = await assertTicketAccess({
    ticketNumber: input.ticketNumber,
    userId: session.user.id,
    role,
  });

  if (role === "CUSTOMER") {
    await setTicketStatus({
      ticketId: ticket.id,
      status: input.action === "close" ? "CLOSED" : "OPEN",
    });
  } else {
    await requireCapability("tickets:status_any");
    await setTicketStatus({
      ticketId: ticket.id,
      status: input.action === "close" ? "CLOSED" : "OPEN",
    });
  }

  revalidatePath(`/account/tickets/${ticket.ticketNumber}`);
  revalidatePath(`/admin/tickets/${ticket.ticketNumber}`);
}

export async function staffUpdateTicket(input: {
  ticketNumber: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string | null;
}) {
  const { session } = await requireCapability("tickets:status_any");
  const ticket = await db.ticket.findUnique({
    where: { ticketNumber: input.ticketNumber },
  });
  if (!ticket) throw new Error("Ticket not found");

  if (input.status) {
    await setTicketStatus({ ticketId: ticket.id, status: input.status });
  }
  if (input.priority) {
    await db.ticket.update({
      where: { id: ticket.id },
      data: { priority: input.priority },
    });
  }
  if (input.assigneeId) {
    await requireCapability("tickets:assign");
    await assignTicket({
      ticketId: ticket.id,
      assigneeId: input.assigneeId,
      assignedById: session.user.id,
    });
  }
  if (input.assigneeId === null) {
    await requireCapability("tickets:assign");
    await db.ticket.update({
      where: { id: ticket.id },
      data: { assignedToId: null },
    });
  }

  await writeAuditLog({
    actorId: session.user.id,
    action: "ticket.staff_update",
    targetType: "Ticket",
    targetId: ticket.id,
    meta: {
      status: input.status ?? null,
      priority: input.priority ?? null,
      assigneeId: input.assigneeId ?? null,
    },
  });

  revalidatePath(`/admin/tickets/${ticket.ticketNumber}`);
  revalidatePath("/admin/tickets");
}

export async function staffAddInternalNote(input: {
  ticketNumber: string;
  body: string;
}) {
  const { session } = await requireCapability("tickets:internal_note");
  const ticket = await db.ticket.findUnique({
    where: { ticketNumber: input.ticketNumber },
  });
  if (!ticket) throw new Error("Ticket not found");

  await addInternalNote({
    ticketId: ticket.id,
    authorId: session.user.id,
    body: input.body,
  });

  revalidatePath(`/admin/tickets/${ticket.ticketNumber}`);
}

export async function staffAssignTicketForm(formData: FormData) {
  const ticketNumber = String(formData.get("ticketNumber") ?? "");
  const assigneeId = String(formData.get("assigneeId") ?? "");
  const status = (formData.get("status") as TicketStatus | null) || undefined;
  const priority = (formData.get("priority") as TicketPriority | null) || undefined;
  await staffUpdateTicket({
    ticketNumber,
    assigneeId: assigneeId || undefined,
    status,
    priority,
  });
}
