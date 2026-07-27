# Demo Test Guide — Support & Order Management

QA checklist for local verification of Mission Control (customer) and Operations Center (admin).

## Prerequisites

```bash
cd "/Users/syedfakhir/Documents/NOVAX lights/SEO/ariszay"
docker compose up -d
pnpm exec dotenv -e .env.local -- prisma db push
pnpm db:seed
pnpm verify:support    # optional automated suite (33 checks)
pnpm dev
```

Open: [http://localhost:3000](http://localhost:3000)

---

## Accounts (after `pnpm verify:support` or create manually)

| Role | Email | Password |
|------|-------|----------|
| Admin (Owner) | `admin@localhost.local` | `AdminPassword!dev123` |
| Customer A | `qa-customer-a@test.local` | `QaCustomer!12345` |
| Customer B | `qa-customer-b@test.local` | `QaCustomer!12345` |
| Support Agent | `qa-agent@test.local` | `QaAgent!1234567` |
| Support Manager | `qa-manager@test.local` | `QaManager!123456` |

To create a customer yourself: `/auth/sign-up` → then sign in at `/auth/sign-in`.

---

## 1. Create / login as test customer

- [ ] Go to `/auth/sign-in`
- [ ] Sign in as `qa-customer-a@test.local` / `QaCustomer!12345`
- [ ] **Expected:** lands in account or home; header shows signed-in state

---

## 2. Browse products

- [ ] Open `/` or `/games/isle`
- [ ] Open `/cheats/the-isle/xray`
- [ ] **Expected:** marketplace industrial UI loads; gameplay video on Isle Xray; no layout break

---

## 3–5. Create order + automatic ticket

### Option A — UI checkout (logged in)

1. Add product to cart **or** open checkout with a known DB product/plan (cart may need items from drawer if wired).
2. Prefer: use checkout page after adding from cart drawer if available.
3. Complete checkout while signed in as Customer A.
4. Land on `/checkout/success?...`

**Expected:**
- Success page shows order `AZ-*`
- Message: **Your support ticket has been created** + `SUP-*`
- Links to View order / Open ticket

### Option B — automated seed of sample order/ticket

```bash
pnpm verify:support
```

**Expected:** script prints sample `AZ-*` / `SUP-*` and creates QA users.

---

## 6. View customer order (Mission Control)

- [ ] Go to `/account`
- [ ] Open **My Orders** → `/account/orders`
- [ ] Click order `AZ-*`
- [ ] **Expected:** products, payment/order/delivery status, timestamps in Spain time (CET/CEST), actions for ticket + refund

---

## 7. View automatic ticket

- [ ] `/account/tickets`
- [ ] Open `SUP-*` linked to the order
- [ ] **Expected:** category Order Support, auto message with order/product/payment info, Madrid timestamps

---

## 8. Customer reply

- [ ] On ticket page, type a reply → Send reply
- [ ] **Expected:** message appears; status becomes **Waiting for Staff**

---

## 9. Attachments

- [ ] Reply with a PNG/JPEG/PDF under 5MB attached
- [ ] Click the attachment link
- [ ] **Expected:** file downloads/opens; not a public `/public` URL

---

## 10. Close / reopen

- [ ] Click **Close ticket** → status Closed
- [ ] Click **Reopen ticket** → can reply again
- [ ] **Expected:** close blocks new replies until reopen

---

## 11–12. Refund request + status

- [ ] From order detail → **Request refund**
- [ ] Choose reason + description → Submit
- [ ] Open `/account/refunds`
- [ ] **Expected:** status **Requested**; linked ticket category Refund Request
- [ ] After admin updates (step below), status shows Reviewing / Approved / Rejected / Completed

---

## Admin — Operations Center

### 1–2. Login + open ops

- [ ] Sign out → `/auth/sign-in` as `admin@localhost.local` / `AdminPassword!dev123`
- [ ] Open `/admin`
- [ ] Sidebar shows **Tickets** and **Refunds** (Ops)

### 3–4. New tickets / refunds appear

- [ ] `/admin/tickets` — stats + queue includes new `SUP-*`
- [ ] `/admin/refunds` — refund request listed

### 5–8. Ticket detail

- [ ] Open ticket
- [ ] **Expected:** customer email, linked order, products, payment status, message thread

### 9. Staff reply

- [ ] Reply as admin
- [ ] **Expected:** customer status **Waiting for Customer**; customer gets notification/email (console in dev)

### 10–12. Status, priority, assignment

- [ ] Set status / priority → Update ticket
- [ ] Assign to `qa-agent@test.local`
- [ ] **Expected:** assignee shows on sidebar; assignment history saved

### 13. Internal notes

- [ ] Add internal note containing unique text e.g. `INTERNAL SECRET`
- [ ] As admin: note visible in yellow **Internal notes** panel
- [ ] Sign in as Customer A → open same ticket
- [ ] **Expected:** `INTERNAL SECRET` **not** present in page HTML

---

## Security checks

| Test | Steps | Expected |
|------|-------|----------|
| Cross-order | Customer B opens Customer A `/account/orders/AZ-*` | **404** |
| Cross-ticket | Customer B opens Customer A `/account/tickets/SUP-*` | **404** |
| Internal notes | Customer A ticket page | No internal note text |
| Attachment | Customer B hits `/api/support/attachments/{id}` | **403** |
| Anon attachment | Logged out attachment URL | **401** |
| Customer admin | Customer A opens `/admin` | Redirect away (**307**) |
| Agent refunds | `qa-agent` opens `/admin/refunds` | Redirect to `/admin` (no review access) |
| Agent orders edit | Agent on order detail | No status edit form (Owner/Admin only) |

---

## Timezone check

- [ ] Ticket created/reply times show **CET** or **CEST** (Europe/Madrid)
- [ ] Order “Purchased …” uses Madrid formatting
- [ ] DB stores UTC (`createdAt` in Prisma/Postgres timestamptz)

---

## UI check

- [ ] No 404 on account nav (Orders, Tickets, Refunds, Profile, Security)
- [ ] Marketplace home/game/cheat pages still industrial style
- [ ] Narrow browser width: account + ticket pages usable

---

## Commands to re-verify anytime

```bash
pnpm verify:support
pnpm typecheck
pnpm lint
pnpm build
```

---

## Expected results summary

| Step | Pass criteria |
|------|----------------|
| Purchase (logged in) | `AZ-*` order + `SUP-*` auto ticket |
| Success page | Ticket created message |
| Mission Control | Own orders/tickets/refunds only |
| Reply | Message saved; Waiting for Staff |
| Attachment | Private download for owner/staff |
| Refund | Requested → visible to customer + admin queue |
| Ops Center | Ticket/refund queues work |
| Internal note | Staff only |
| RBAC | Agent cannot review refunds or edit orders |
