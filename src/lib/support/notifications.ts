import type { NotificationType } from "@prisma/client";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  email?: { to: string; subject: string; html: string; text?: string };
}) {
  await db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
    },
  });

  if (input.email) {
    await sendEmail(input.email).catch(() => null);
  }
}

export async function notifyStaff(input: {
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  email?: { subject: string; html: string; text?: string };
}) {
  const staff = await db.user.findMany({
    where: { role: { in: ["OWNER", "ADMIN", "SUPPORT_MANAGER"] } },
    select: { id: true, email: true },
  });

  const supportNotify = process.env.SUPPORT_NOTIFY_EMAIL;

  await Promise.all(
    staff.map((s) =>
      createNotification({
        userId: s.id,
        type: input.type,
        title: input.title,
        body: input.body,
        href: input.href,
      }),
    ),
  );

  if (input.email) {
    const recipients = supportNotify
      ? [supportNotify]
      : staff.map((s) => s.email).filter(Boolean);
    await Promise.all(
      recipients.map((to) =>
        sendEmail({ to, ...input.email! }).catch(() => null),
      ),
    );
  }
}
