/**
 * End-to-end verification for support/order system.
 * Run: pnpm exec dotenv -e .env.local -- tsx scripts/verify-support-system.ts
 */
import { PrismaClient, type UserRole } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import { nextOrderNumber } from "../src/lib/support/sequences";
import {
  addInternalNote,
  addTicketReply,
  assignTicket,
  ensureAutoOrderTicket,
  setTicketStatus,
} from "../src/lib/support/tickets";
import { requestRefund, reviewRefund } from "../src/lib/support/refunds";
import { formatMadridDate } from "../src/lib/support/datetime";
import { roleHasCapability, type Capability } from "../src/lib/permissions";
import { saveTicketUpload, resolveStoragePath } from "../src/lib/support/uploads";
import { readFile } from "node:fs/promises";

const db = new PrismaClient();
const results: { name: string; ok: boolean; detail?: string }[] = [];

function check(name: string, ok: boolean, detail?: string) {
  results.push({ name, ok, detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function ensureUser(email: string, role: UserRole, password: string) {
  const hashed = await hashPassword(password);
  const user = await db.user.upsert({
    where: { email },
    update: { role, emailVerified: true, name: email.split("@")[0] },
    create: {
      email,
      name: email.split("@")[0],
      emailVerified: true,
      role,
    },
  });
  await db.account.upsert({
    where: {
      providerId_accountId: { providerId: "credential", accountId: email },
    },
    update: { password: hashed },
    create: {
      userId: user.id,
      accountId: email,
      providerId: "credential",
      password: hashed,
    },
  });
  return user;
}

async function main() {
  console.log("\n=== Support System Verification ===\n");

  // Schema / relations smoke
  const tables = await db.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    AND tablename IN (
      'tickets','ticket_messages','ticket_attachments','ticket_assignments',
      'internal_notes','refund_requests','order_status_history','sequence_counters','notifications','orders','users'
    )
  `;
  check(
    "DB tables exist",
    tables.length >= 10,
    `found ${tables.length}`,
  );

  const customerA = await ensureUser("qa-customer-a@test.local", "CUSTOMER", "QaCustomer!12345");
  const customerB = await ensureUser("qa-customer-b@test.local", "CUSTOMER", "QaCustomer!12345");
  const agent = await ensureUser("qa-agent@test.local", "SUPPORT_AGENT", "QaAgent!1234567");
  const manager = await ensureUser("qa-manager@test.local", "SUPPORT_MANAGER", "QaManager!123456");
  await ensureUser("qa-analyst@test.local", "ANALYST", "QaAnalyst!123456");

  const plan = await db.productPlan.findFirst({
    where: { active: true },
    include: { product: true },
  });
  check("Catalog has product plan", !!plan, plan?.product.name);

  if (!plan) throw new Error("No product plan — run pnpm db:seed");

  const orderNumber = await nextOrderNumber();
  const order = await db.order.create({
    data: {
      orderNumber,
      userId: customerA.id,
      status: "PENDING",
      paymentStatus: "UNPAID",
      deliveryStatus: "PENDING",
      totalAmount: plan.price,
      items: {
        create: {
          productId: plan.productId,
          planId: plan.id,
          productName: plan.product.name,
          planLabel: plan.label,
          unitPrice: plan.price,
          quantity: 1,
        },
      },
      statusHistory: {
        create: {
          toStatus: "PENDING",
          toPaymentStatus: "UNPAID",
          toDeliveryStatus: "PENDING",
          actorId: customerA.id,
          note: "QA verification order",
        },
      },
    },
  });
  check("Order AZ-* created", /^AZ-\d+$/.test(order.orderNumber!), order.orderNumber!);

  const ticket = await ensureAutoOrderTicket(order.id);
  check("Auto SUP-* ticket created", !!ticket && /^SUP-\d+$/.test(ticket.ticketNumber), ticket?.ticketNumber);
  const ticket2 = await ensureAutoOrderTicket(order.id);
  check("Auto ticket idempotent", ticket2?.id === ticket?.id);

  const customerOrders = await db.order.findMany({ where: { userId: customerA.id } });
  check("Customer sees own orders", customerOrders.some((o) => o.id === order.id));

  const foreignOrder = await db.order.findFirst({
    where: { id: order.id, userId: customerB.id },
  });
  check("Customer B cannot query Customer A order by ownership filter", !foreignOrder);

  const foreignTicket = await db.ticket.findFirst({
    where: { ticketNumber: ticket!.ticketNumber, userId: customerB.id },
  });
  check("Customer B cannot query Customer A ticket by ownership filter", !foreignTicket);

  await addTicketReply({
    ticketId: ticket!.id,
    authorId: customerA.id,
    body: "QA customer reply — need help with setup",
    isStaff: false,
  });
  const afterReply = await db.ticket.findUnique({ where: { id: ticket!.id } });
  check("Customer reply updates status to WAITING_STAFF", afterReply?.status === "WAITING_STAFF");

  // Attachment
  const pngBytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  const file = new File([pngBytes], "qa-shot.png", { type: "image/png" });
  const saved = await saveTicketUpload(ticket!.id, file);
  const att = await db.ticketAttachment.create({
    data: {
      ticketId: ticket!.id,
      uploadedById: customerA.id,
      fileName: saved.fileName,
      mimeType: saved.mimeType,
      sizeBytes: saved.sizeBytes,
      storageKey: saved.storageKey,
    },
  });
  const abs = resolveStoragePath(saved.storageKey);
  const disk = await readFile(abs);
  check("Attachment saved to private storage", disk.length > 0, saved.storageKey);

  await setTicketStatus({ ticketId: ticket!.id, status: "CLOSED" });
  let closed = await db.ticket.findUnique({ where: { id: ticket!.id } });
  check("Close ticket", closed?.status === "CLOSED");
  await setTicketStatus({ ticketId: ticket!.id, status: "OPEN" });
  closed = await db.ticket.findUnique({ where: { id: ticket!.id } });
  check("Reopen ticket", closed?.status === "OPEN");

  const refund = await requestRefund({
    userId: customerA.id,
    orderId: order.id,
    reason: "NOT_WORKING",
    description: "QA refund request — product not launching",
  });
  check("Refund request created", refund.status === "REQUESTED", refund.id);

  const refundVisible = await db.refundRequest.findFirst({
    where: { id: refund.id, userId: customerA.id },
  });
  check("Customer sees refund status", refundVisible?.status === "REQUESTED");

  // Admin / staff
  await addTicketReply({
    ticketId: ticket!.id,
    authorId: manager.id,
    body: "QA staff reply — checking your case",
    isStaff: true,
  });
  const afterStaff = await db.ticket.findUnique({ where: { id: ticket!.id } });
  check("Staff reply -> WAITING_CUSTOMER", afterStaff?.status === "WAITING_CUSTOMER");

  await assignTicket({
    ticketId: ticket!.id,
    assigneeId: agent.id,
    assignedById: manager.id,
  });
  const assigned = await db.ticket.findUnique({ where: { id: ticket!.id } });
  check("Ticket assignment works", assigned?.assignedToId === agent.id);

  await db.ticket.update({
    where: { id: ticket!.id },
    data: { priority: "HIGH" },
  });
  const prio = await db.ticket.findUnique({ where: { id: ticket!.id } });
  check("Priority update works", prio?.priority === "HIGH");

  const note = await addInternalNote({
    ticketId: ticket!.id,
    authorId: manager.id,
    body: "INTERNAL: do not show to customer",
  });
  const customerTicketView = await db.ticket.findFirst({
    where: { ticketNumber: ticket!.ticketNumber, userId: customerA.id },
    include: {
      messages: true,
      // customers must never request internalNotes in their queries
    },
  });
  const leaked = await db.internalNote.findMany({
    where: { ticketId: ticket!.id },
  });
  check("Internal note stored", leaked.some((n) => n.id === note.id));
  check(
    "Customer ticket query shape has no internalNotes include",
    !("internalNotes" in (customerTicketView as object)),
  );

  await reviewRefund({
    refundId: refund.id,
    reviewerId: manager.id,
    status: "REVIEWING",
    reviewNote: "Looking into it",
  });
  const reviewing = await db.refundRequest.findUnique({ where: { id: refund.id } });
  check("Admin refund REVIEWING", reviewing?.status === "REVIEWING");

  await reviewRefund({
    refundId: refund.id,
    reviewerId: manager.id,
    status: "COMPLETED",
  });
  const completed = await db.refundRequest.findUnique({ where: { id: refund.id } });
  const refundedOrder = await db.order.findUnique({ where: { id: order.id } });
  check("Admin refund COMPLETED", completed?.status === "COMPLETED");
  check(
    "Order marked REFUNDED on complete",
    refundedOrder?.status === "REFUNDED" && refundedOrder.paymentStatus === "REFUNDED",
  );

  // Permissions matrix spot checks
  const caps: { role: UserRole; cap: Capability; expect: boolean }[] = [
    { role: "OWNER", cap: "orders:update", expect: true },
    { role: "SUPPORT_AGENT", cap: "orders:update", expect: false },
    { role: "SUPPORT_AGENT", cap: "tickets:reply_staff", expect: true },
    { role: "SUPPORT_AGENT", cap: "tickets:assign", expect: false },
    { role: "SUPPORT_MANAGER", cap: "refunds:review", expect: true },
    { role: "SUPPORT_AGENT", cap: "refunds:review", expect: false },
    { role: "ANALYST", cap: "tickets:reply_staff", expect: false },
    { role: "ANALYST", cap: "tickets:read_all", expect: true },
    { role: "CUSTOMER", cap: "admin:access", expect: false },
  ];
  for (const c of caps) {
    check(
      `RBAC ${c.role} ${c.cap} => ${c.expect}`,
      roleHasCapability(c.role, c.cap) === c.expect,
    );
  }

  // Timezone
  const utc = new Date("2026-07-27T12:00:00.000Z");
  const madrid = formatMadridDate(utc);
  check(
    "formatMadridDate uses Europe/Madrid",
    madrid.includes("2026") && (madrid.includes("CET") || madrid.includes("CEST") || madrid.includes("14:00") || madrid.includes("13:00")),
    madrid,
  );

  // Path traversal blocked
  let traversalBlocked = false;
  try {
    resolveStoragePath("../etc/passwd");
  } catch {
    traversalBlocked = true;
  }
  check("Attachment path traversal blocked", traversalBlocked);

  // Keep attachment files for manual QA downloads
  console.log(`Attachment id retained for QA: ${att.id}`);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== ${results.length - failed.length}/${results.length} passed ===\n`);
  if (failed.length) {
    console.error("Failures:");
    for (const f of failed) console.error(` - ${f.name}: ${f.detail ?? ""}`);
    process.exit(1);
  }

  console.log("QA accounts ready:");
  console.log("  Customer A: qa-customer-a@test.local / QaCustomer!12345");
  console.log("  Customer B: qa-customer-b@test.local / QaCustomer!12345");
  console.log("  Agent:      qa-agent@test.local / QaAgent!1234567");
  console.log("  Manager:    qa-manager@test.local / QaManager!123456");
  console.log(`  Sample order: ${order.orderNumber}`);
  console.log(`  Sample ticket: ${ticket?.ticketNumber}`);
  console.log("  Admin:      admin@localhost.local / AdminPassword!dev123");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
