#!/bin/bash
set -euo pipefail
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/Users/syedfakhir/.local/bin:/usr/local/bin"
cd "/Users/syedfakhir/Documents/NOVAX lights/SEO/ariszay"

COOKIE_A=$(mktemp)
COOKIE_B=$(mktemp)
COOKIE_ADMIN=$(mktemp)
trap 'rm -f "$COOKIE_A" "$COOKIE_B" "$COOKIE_ADMIN"' EXIT

curl -sS -c "$COOKIE_A" -b "$COOKIE_A" -X POST "http://localhost:3000/api/auth/sign-in/email" \
  -H "Content-Type: application/json" \
  -d '{"email":"qa-customer-a@test.local","password":"QaCustomer!12345"}' >/tmp/signin-a.json

curl -sS -c "$COOKIE_B" -b "$COOKIE_B" -X POST "http://localhost:3000/api/auth/sign-in/email" \
  -H "Content-Type: application/json" \
  -d '{"email":"qa-customer-b@test.local","password":"QaCustomer!12345"}' >/tmp/signin-b.json

curl -sS -c "$COOKIE_ADMIN" -b "$COOKIE_ADMIN" -X POST "http://localhost:3000/api/auth/sign-in/email" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@localhost.local","password":"AdminPassword!dev123"}' >/tmp/signin-admin.json

echo "Signed in OK"
echo "--- pages ---"
for path in / /account /account/orders /account/tickets /account/refunds /account/profile /account/security /checkout /cheats/the-isle/xray /games/isle; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" -b "$COOKIE_A" "http://localhost:3000$path")
  echo "CUST  $code $path"
done
for path in /admin /admin/tickets /admin/refunds /admin/orders /admin/customers; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" -b "$COOKIE_ADMIN" "http://localhost:3000$path")
  echo "ADMIN $code $path"
done
code=$(curl -sS -o /dev/null -w "%{http_code}" -b "$COOKIE_A" "http://localhost:3000/admin")
echo "CUST_ADMIN $code"

pnpm exec dotenv -e .env.local -- tsx <<'TS' >/tmp/qa-data.json
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const o = await db.order.findFirst({
  where: { user: { email: "qa-customer-a@test.local" }, orderNumber: { not: null } },
  orderBy: { createdAt: "desc" },
});
const t = await db.ticket.findFirst({
  where: { user: { email: "qa-customer-a@test.local" } },
  orderBy: { createdAt: "desc" },
});
const noteTicket = await db.ticket.findFirst({
  where: { internalNotes: { some: { body: { contains: "INTERNAL" } } } },
  include: { internalNotes: true },
  orderBy: { createdAt: "desc" },
});
const att = await db.ticketAttachment.findFirst({
  where: { ticket: { user: { email: "qa-customer-a@test.local" } } },
  orderBy: { createdAt: "desc" },
});
console.log(JSON.stringify({
  orderNumber: o?.orderNumber ?? null,
  ticketNumber: t?.ticketNumber ?? null,
  noteTicket: noteTicket?.ticketNumber ?? null,
  attId: att?.id ?? null,
}));
await db.$disconnect();
TS

cat /tmp/qa-data.json
ORDER_NUM=$(python3 -c 'import json;print(json.load(open("/tmp/qa-data.json"))["orderNumber"] or "")')
TICKET_NUM=$(python3 -c 'import json;print(json.load(open("/tmp/qa-data.json"))["ticketNumber"] or "")')
NOTE_TICKET=$(python3 -c 'import json;print(json.load(open("/tmp/qa-data.json"))["noteTicket"] or "")')
ATT_ID=$(python3 -c 'import json;print(json.load(open("/tmp/qa-data.json"))["attId"] or "")')

echo "order=$ORDER_NUM ticket=$TICKET_NUM noteTicket=$NOTE_TICKET att=$ATT_ID"
echo "A order $(curl -sS -o /dev/null -w "%{http_code}" -b "$COOKIE_A" "http://localhost:3000/account/orders/$ORDER_NUM")"
echo "B order $(curl -sS -o /dev/null -w "%{http_code}" -b "$COOKIE_B" "http://localhost:3000/account/orders/$ORDER_NUM")"
echo "A ticket $(curl -sS -o /dev/null -w "%{http_code}" -b "$COOKIE_A" "http://localhost:3000/account/tickets/$TICKET_NUM")"
echo "B ticket $(curl -sS -o /dev/null -w "%{http_code}" -b "$COOKIE_B" "http://localhost:3000/account/tickets/$TICKET_NUM")"

if [ -n "$NOTE_TICKET" ]; then
  if curl -sS -b "$COOKIE_A" "http://localhost:3000/account/tickets/$NOTE_TICKET" | grep -q "INTERNAL: do not show"; then
    echo "LEAK internal note on customer page"
  else
    echo "PASS customer HTML hides internal note"
  fi
  if curl -sS -b "$COOKIE_ADMIN" "http://localhost:3000/admin/tickets/$NOTE_TICKET" | grep -q "INTERNAL: do not show"; then
    echo "PASS admin sees internal note"
  else
    echo "FAIL admin missing internal note"
  fi
fi

if [ -n "$ATT_ID" ]; then
  echo "A att $(curl -sS -o /dev/null -w "%{http_code}" -b "$COOKIE_A" "http://localhost:3000/api/support/attachments/$ATT_ID")"
  echo "B att $(curl -sS -o /dev/null -w "%{http_code}" -b "$COOKIE_B" "http://localhost:3000/api/support/attachments/$ATT_ID")"
  echo "ANON att $(curl -sS -o /dev/null -w "%{http_code}" "http://localhost:3000/api/support/attachments/$ATT_ID")"
fi
