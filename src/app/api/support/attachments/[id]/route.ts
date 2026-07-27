import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";

import { getServerSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { roleHasCapability } from "@/lib/permissions";
import { resolveStoragePath } from "@/lib/support/uploads";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const attachment = await db.ticketAttachment.findUnique({
    where: { id },
    include: { ticket: { select: { userId: true, assignedToId: true } } },
  });
  if (!attachment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const role = ((session.user as { role?: UserRole }).role ?? "CUSTOMER") as UserRole;
  const isOwner = attachment.ticket.userId === session.user.id;
  const isStaff = roleHasCapability(role, "tickets:read_all");

  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const abs = resolveStoragePath(attachment.storageKey);
    const data = await readFile(abs);
    return new NextResponse(data, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": `inline; filename="${attachment.fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
