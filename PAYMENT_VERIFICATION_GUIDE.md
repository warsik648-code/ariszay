# Payment Verification Guide — Rewarble Visa Gift Cards

## How customers pay

1. Add a product via **Buy Now** (cart + checkout).
2. On `/checkout`, select **Rewarble Visa Gift Card** (current payment method).
3. **Step 1** — Open the matching G2A link:
   - Order total **$35** → [Rewarble $35](https://www.g2a.com/rewarble-visa-gift-card-35-usd-by-rewarble-key-global-i10000502992020)
   - Order total **$150** → [Rewarble $150](https://www.g2a.com/rewarble-visa-gift-card-150-usd-by-rewarble-key-global-i10000502992008)
4. **Step 2** — Paste the gift card / promo code (`XXXX-XXXX-XXXX-XXXX`).
5. **Step 3** — Enter Discord username.
6. Agree to terms → **Submit & Place Order**.

### After submit

- Order is created with:
  - `Order.status` = `PENDING`
  - `Order.paymentStatus` = `PENDING` (shown as **Pending Verification**)
  - Customer-facing order label: **Awaiting Payment Verification**
- A `PaymentVerification` row is created (`status: PENDING`).
- A `Payment` stub is created (`provider: REWARBLE_VISA_GIFT_CARD`, `status: PENDING`).
- Success page: “Payment code submitted successfully. Your order is being reviewed.”
- Logged-in customers still get auto support ticket `SUP-*` when applicable.
- **Order is not marked Paid** until an Owner/Admin approves.

Track progress: `/account/orders` → order detail (masked code only: `XXXX-XXXX-XXXX-1234`).

---

## How admins verify

1. Sign in as Owner/Admin → `/admin/payments`
2. Open the **Pending Verification** queue.
3. Open a row → review customer, Discord, amount, masked code, line items.
4. **Reveal full code** (Owner/Admin only) — every reveal is audit-logged.
5. Actions:
   - **Approve** → verification `APPROVED`, order `PAID` / payment `PAID`, delivery may move to `PROCESSING`, customer notified.
   - **Reject** → verification `REJECTED`, payment `FAILED`, customer sees **Payment Failed** (+ optional reason).
6. Internal notes are staff-only.

Support agents can open the queue and see **masked** codes only. They cannot reveal, approve, or reject.

---

## How codes are stored

| Layer | Behavior |
|-------|----------|
| At rest | AES-256-GCM encrypted (`giftCardCodeEncrypted`) |
| Display (customer / support) | Masked via `giftCardLast4` → `XXXX-XXXX-XXXX-1234` |
| Full code | Decrypted only via `revealGiftCardCode` for roles with `payments:view_code` (OWNER, ADMIN) |
| Audit | `payment.code_view`, `payment.approve`, `payment.reject`, `payment.note` in `audit_logs` (+ IP/UA when available) |
| Key | `GIFT_CARD_ENCRYPTION_KEY` or fallback `BETTER_AUTH_SECRET` |

Never put full codes in notifications, emails, or customer UI.

---

## Permissions

| Capability | OWNER | ADMIN | SUPPORT_* |
|------------|-------|-------|-----------|
| View payments queue | ✓ | ✓ | ✓ (admin access) |
| Reveal full code | ✓ | ✓ | ✗ |
| Approve / reject | ✓ | ✓ | ✗ |

---

## Local demo test

```bash
docker compose up -d
pnpm exec dotenv -e .env.local -- prisma db push
pnpm db:seed
pnpm dev
```

### Customer path

1. Sign in: `qa-customer-a@test.local` / `QaCustomer!12345` (or create account).
2. `/cheats/the-isle/xray` → Buy Now ($35 monthly or $150 lifetime).
3. Checkout → open G2A link (or skip and paste a fake test code like `TEST-CODE-ABCD-1234`).
4. Enter Discord + code → Submit.
5. Confirm success messaging + `/account/orders` shows **Pending Verification**.

### Admin path

1. Sign in: `admin@localhost.local` / `AdminPassword!dev123`
2. `/admin/payments` → open pending request.
3. Reveal code (check audit log appears).
4. Approve → customer order shows **Paid**.
5. (Optional) submit another order and **Reject** → customer sees **Payment Failed**.

### Permission spot-checks

- Customer order page: only masked code.
- Support agent: can open `/admin/payments` but cannot reveal/approve (buttons hidden / actions unauthorized).

---

## Related files

- Schema: `PaymentVerification` in `prisma/schema.prisma`
- Checkout: `src/app/checkout/page.tsx`, `src/app/actions/checkout.ts`
- Admin: `src/app/admin/payments/*`, `src/app/actions/admin/payments.ts`
- Crypto/mask: `src/lib/payments/gift-card.ts`
- G2A links: `src/lib/payments/rewarble.ts`
