# ArisZay — Development History

> Internal documentation for the ArisZay gaming marketplace project.  
> Covers all work from initial commit to current state.  
> Last updated: July 27, 2026.

---

## Table of Contents

1. [Project Vision](#project-vision)
2. [Phase 1 — Project Initialization](#phase-1--project-initialization)
3. [Phase 2 — Core Marketplace Build](#phase-2--core-marketplace-build)
4. [Phase 3 — English-Only Migration](#phase-3--english-only-migration)
5. [Phase 4 — Marketplace Redesign](#phase-4--marketplace-redesign)
6. [Phase 5 — Docker & Local Development](#phase-5--docker--local-development)
7. [Current Architecture](#current-architecture)
8. [Folder Structure](#folder-structure)
9. [Marketplace Data Flow](#marketplace-data-flow)
10. [Features Implemented](#features-implemented)
11. [Remaining Roadmap](#remaining-roadmap)
12. [Lessons Learned](#lessons-learned)
13. [Current Status](#current-status)

---

## Project Vision

### Why it was created

ArisZay is a **premium gaming enhancement software marketplace** specializing in tools for survival and competitive games. The project was built to serve players looking for external overlay tools — specifically for *The Isle: Evrima* and *Naraka: Bladepoint* — through a trustworthy, honest storefront.

The core problem the project solves: most gaming cheat marketplaces are poorly designed, full of fake claims ("undetected guaranteed"), broken checkout flows, and external redirect links that lead users away from the site to untrusted payment pages. ArisZay was built to be the alternative — clean, honest, and fully internal.

### Initial goals

- Build a marketplace that communicates product availability honestly (no fake "undetected" guarantees)
- Implement a real e-commerce flow: cart → checkout → order → delivery
- Create a secure admin portal for managing products, orders, coupons, and users
- Support SEO properly with structured data, sitemaps, and correct metadata
- Design a premium dark UI that signals trustworthiness and quality

### Target audience

- Competitive PC gamers playing The Isle: Evrima and Naraka: Bladepoint
- Buyers expecting clear product status, honest pricing, and instant digital delivery
- Operators needing a single admin dashboard to manage the entire catalog

### Long-term vision

- Expand to additional games without code changes (data-driven architecture)
- Integrate a real payment provider (Stripe or crypto processor)
- Add license key generation and automated delivery
- Build a customer self-service portal for license management
- Grow the admin portal into a full business dashboard with analytics

---

## Phase 1 — Project Initialization

**Git commits:** `a1966aa` → `1e3c7eb`  
**Date:** July 27, 2026

### What was built

The foundation of the project was assembled in six sequential commits, each adding one layer of tooling.

#### Framework selection

**Next.js 15** was chosen as the framework for the following reasons:

- App Router supports server components, which allows fetching data server-side without API routes for most page content
- `generateStaticParams` enables static pre-rendering of all product and game pages at build time
- File-based routing maps cleanly to the marketplace URL structure
- React 19 with its streaming architecture handles dynamic sections well
- Strong ecosystem alignment with the chosen UI library (shadcn/ui)

#### Initial tech stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSG/SSR, TypeScript-first, Vercel-optimized |
| Language | TypeScript (strict) | Type safety for product data and API contracts |
| Styling | Tailwind CSS v4 + PostCSS | Utility-first, pairs well with shadcn/ui |
| UI components | shadcn/ui (Radix primitives) | Accessible, unstyled base, neutral design system |
| Linting | ESLint (flat config) | Enforces consistent code quality |
| Formatting | Prettier | Consistent code style across all files |
| Package manager | pnpm | Faster installs, strict workspace management |

#### Initial project structure

```
src/
  app/          # Next.js App Router pages
  components/   # shared/ and ui/ directories
  config/       # site config, env validation
  hooks/        # (placeholder)
  features/     # (placeholder)
  types/        # TypeScript types
  lib/          # utilities
```

#### Environment validation

Environment variables are validated at startup using **Zod** (`src/env.ts`). If a required variable is missing or malformed, the server refuses to start with a clear error rather than crashing at runtime. Variables validated include:

- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — minimum 32-character auth secret
- `BETTER_AUTH_URL` — base URL for auth callbacks
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` — initial admin seeding
- `SMTP_*` — optional email configuration
- `NEXT_PUBLIC_SITE_URL` — public site URL for canonical URLs and sitemap

#### Site configuration

`src/config/site.ts` holds the centralized site metadata object (`siteConfig`) including name, description, URL, and Open Graph defaults. This object feeds the Next.js `metadata` export used across all pages.

---

## Phase 2 — Core Marketplace Build

**Git commits:** `41b5c1b`, `8497443`  
**Date:** July 27, 2026

This was the largest single development phase, delivering the entire marketplace, authentication, database layer, admin portal, SEO, blog, and checkout system.

### Product model

Two product categories are modelled:

**Cheat tiers** (`src/data/cheats.ts`) — organized by game and tier:

| Game | Tier | Monthly | Lifetime |
|---|---|---|---|
| The Isle | Xray (Core ESP) | $14.99 | — |
| The Isle | Pro (Aim Assist) | $24.99 | — |
| The Isle | Private (Full Aimbot) | $29.99 | $99.99 |
| Naraka: Bladepoint | Xray | $14.99 | — |
| Naraka: Bladepoint | Pro | $24.99 | — |
| Naraka: Bladepoint | Private | $29.99 | $99.99 |

**Utility products** (`src/data/products.ts`):

| Product | Price | Type |
|---|---|---|
| UGC | $49.99 | Account recovery tool |
| Skin Changer | $39.99 | Cosmetic unlocker |
| Cloud DMA | $50.00 | Single-PC DMA bridge |
| HWID Spoofer | $34.99 | Hardware ID reset |

### Database schema (Prisma)

PostgreSQL with Prisma ORM. Schema defined at `prisma/schema.prisma`. Entities:

**Authentication:**
- `User` — email, role (CUSTOMER / SUPPORT / CONTENT_MANAGER / ANALYST / ADMIN / OWNER), ban status
- `Session` — session token, expiry, IP, user agent
- `Account` — OAuth or credential provider record
- `Verification` — email/password reset tokens

**Catalog:**
- `Game` — slug, cheatsSlug, name, accent color, published flag
- `Product` — type (CHEAT/UTILITY), status, featured flag, SEO fields
- `ProductPlan` — label, duration days (null = lifetime), price
- `ProductFeature` — text, sort order
- `ProductImage` — URL, alt text, sort order

**Commerce:**
- `Order` — status (PENDING/PAID/DELIVERED/REFUNDED/CANCELLED), payment status, guest info, totals, coupon/referral codes
- `OrderItem` — product snapshot at purchase time (name, price)
- `Payment` — provider transaction record
- `Coupon` — code, percentage/fixed discount, max usages, expiry
- `CouponUsage` — tracks which user used which coupon on which order
- `Referral` — code, commission percent, click/conversion tracking
- `ReferralConversion` — tracks revenue and commission per referral

**Content:**
- `BlogPost` — full CMS model with slug, content, SEO fields
- `Faq` — questions with optional game association
- `SiteSetting` — key-value store for admin-editable settings

**Admin:**
- `AdminNote` — internal or customer-visible notes on orders/users
- `AuditLog` — full action log: actor, action type, target, before/after meta, IP

### Authentication (Better Auth)

`src/lib/auth.ts` configures **Better Auth** with the Prisma adapter. Better Auth handles:

- Email/password sign-up and sign-in
- Session management with secure HTTP-only cookies
- Password reset flow (forgot password → email → reset)
- Email verification (scaffolded, mailer configurable)

Auth pages:
- `/auth/sign-in`
- `/auth/sign-up`
- `/auth/forgot-password`

Catch-all API route at `/api/auth/[...all]` handles all auth HTTP operations.

**Role-Based Access Control** enforced at two layers:
1. **Middleware** (`middleware.ts`) — checks for the session cookie before allowing any `/admin/*` route
2. **Admin layout** (`src/app/admin/layout.tsx`) — server-side session check with role verification; non-admin roles are redirected

### Admin portal

Located at `/admin/*`. Protected by middleware + layout-level auth check.

| Admin Page | URL | Purpose |
|---|---|---|
| Dashboard | `/admin` | Aggregate stats: orders, revenue, users |
| Orders | `/admin/orders` | Order list with status filtering |
| Order Detail | `/admin/orders/[id]` | Full order view, status update form |
| Products | `/admin/products` | Product listing |
| Games | `/admin/games` | Game listing |
| Customers | `/admin/customers` | User listing |
| Coupons | `/admin/coupons` | Coupon code listing |
| Referrals | `/admin/referrals` | Referral code listing |
| Content | `/admin/content` | Blog posts and FAQs |
| Admin Users | `/admin/users` | Admin-level user management |

The admin sidebar (`src/components/admin/admin-sidebar.tsx`) and header (`src/components/admin/admin-header.tsx`) are persistent layout components.

Order status can be updated via a server action (`src/app/actions/admin/orders.ts`) through a client form (`src/components/admin/order-status-form.tsx`).

### Shopping cart

`src/store/cart.ts` implements a **Zustand** store that persists to `localStorage`. Cart state includes:

- `items[]` — productId, planId, productName, planLabel, price, quantity
- `couponCode` — string field synced to checkout form
- `referralCode` — string field synced to checkout form
- Methods: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `total()`

The cart drawer (`src/components/cart/cart-drawer.tsx`) is a slide-in sheet accessible from the header on all pages. It shows item list, quantity controls, subtotal, and a "Checkout" button linking to `/checkout`.

### Checkout flow

1. User fills `/checkout` (client component) with name, email, optional Discord username, coupon code, referral code
2. On submit, the `createOrder` server action (`src/app/actions/checkout.ts`) is called
3. Server action validates all fields with Zod, verifies prices server-side against the database, creates the order record, and returns a redirect URL
4. On success, cart is cleared and user is sent to `/checkout/success?orderId=...`

> **Payment provider**: Not yet integrated. The checkout creates an order record and the redirect URL is a placeholder. Connecting a provider (Stripe, Coinbase Commerce, etc.) requires implementing the redirect in the server action and a webhook handler.

### Cheat pages

Route structure:

```
/cheats/[gameSlug]          — Game cheat catalog (all tiers for one game)
/cheats/[gameSlug]/[tier]   — Individual tier detail page
```

`gameSlug` corresponds to the game's `cheatsSlug` field:
- `the-isle` → The Isle
- `naraka-bladepoint` → Naraka: Bladepoint

`tier` is one of: `xray`, `pro`, `private`

Each tier detail page (`/cheats/the-isle/xray`) includes:
- Breadcrumb navigation
- Tier badge + status badge
- Description + hero section
- Detection info, delivery info, support info cards
- Image gallery placeholder (managed via admin)
- Monthly and lifetime pricing cards (both link to `/checkout`)
- How to get started steps
- Full feature list (all included features)
- System requirements
- Feature comparison table (all 3 tiers side by side)
- FAQ for that game
- Related tier cards

### Game pages

```
/games/[slug]   — slug is the game's internal slug (isle, naraka)
```

Originally a simple overview page, later redesigned into a full collection page (see Phase 4).

### Blog

`/blog` — searchable, filterable listing (client component `BlogListing`)  
`/blog/[slug]` — full post page with table of contents, related posts, feedback widget

Blog data lives in `src/data/blog.ts` as static TypeScript objects (10 posts seeded). The database has a `BlogPost` model for future CMS-managed content.

### SEO

Implemented across all pages:

- `generateMetadata()` per page (title, description, canonical URL, Open Graph, Twitter cards)
- `JsonLd` component for structured data (Organization, Product, Article, BreadcrumbList schemas)
- `/robots.ts` — generated `robots.txt`
- `/sitemap.ts` — dynamically generated sitemap including all game, cheat, product, and blog URLs
- Heading hierarchy (h1 → h2 → h3) maintained on all pages
- Alt text on all images
- Internal linking throughout (breadcrumbs, related products, blog links)

### Security headers

Configured in `next.config.ts` via the `headers()` function:

- `X-DNS-Prefetch-Control: on`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` — allows only self, Google Fonts, and HTTPS external resources
- `Strict-Transport-Security` — max-age 63072000 with preload

### Email system

`src/lib/email/send.ts` provides a provider abstraction over Nodemailer. In development (no SMTP configured), emails are logged to the console. In production, any standard SMTP provider can be dropped in via environment variables.

`src/lib/email/templates.ts` contains HTML and plain-text templates for transactional emails (order confirmation, delivery, password reset).

### Rate limiting

`src/lib/rate-limit.ts` implements in-memory rate limiting suitable for single-instance deployments. Used to protect authentication endpoints and newsletter signup from abuse.

---

## Phase 3 — English-Only Migration

**Git commits:** `da5a109`, `94bbaef`  
**Date:** July 27, 2026

### Why this decision was made

The initial build included **next-intl** for internationalization, supporting English (`/en/*`) and Chinese (`/zh/*`) locale-prefixed routes. After evaluating the project's actual audience and product content, the decision was made to drop multilingual support entirely.

**Reasons:**
1. All product content (features, descriptions, system requirements) is written in English and has no Chinese translations
2. The `/en/` prefix in every URL was causing "unknown error links" for users — clicking any internal button navigated to a 404 because links were generated without the locale prefix
3. Maintaining two locales doubled the QA surface area with no content benefit
4. The i18n routing layer added complexity (middleware, locale detection, `setRequestLocale`, `getTranslations`) that slowed iteration

### What was removed

| Removed | Replaced with |
|---|---|
| `src/i18n/routing.ts` | — |
| `src/i18n/request.ts` | — |
| `src/i18n/navigation.ts` | Standard `next/link` imports in all files |
| `messages/en.json` | Hardcoded English strings |
| `messages/zh.json` | — |
| `next-intl` plugin in `next.config.ts` | Plain `NextConfig` export |
| `NextIntlClientProvider` in layout | — |
| `useTranslations()` in all components | Direct string literals |
| `setRequestLocale()` in all pages | — |
| `getTranslations()` in all pages | — |
| `src/app/[locale]/` directory | `src/app/` flat structure |

### Route restructuring

All 16 pages moved from `src/app/[locale]/` to `src/app/`:

| Old URL | New URL |
|---|---|
| `/en` | `/` |
| `/en/cheats/the-isle` | `/cheats/the-isle` |
| `/en/cheats/the-isle/xray` | `/cheats/the-isle/xray` |
| `/en/games/isle` | `/games/isle` |
| `/en/products/ugc` | `/products/ugc` |
| `/en/blog` | `/blog` |
| `/en/checkout` | `/checkout` |
| `/en/account` | `/account` |
| `/en/auth/sign-in` | `/auth/sign-in` |
| `/en/admin` | `/admin` |

No `generateStaticParams` changes were needed for most pages — only the removal of `locale` from the params object.

### Layout migration

Before:
```
src/app/layout.tsx           — <html> + <body> (root)
src/app/[locale]/layout.tsx  — fonts + NextIntlClientProvider + SiteHeader + SiteFooter
```

After:
```
src/app/layout.tsx           — <html lang="en"> + <body> + fonts + SiteHeader + SiteFooter + Toaster
```

The locale layout was merged into the root layout, which now directly renders the full page shell. `NextIntlClientProvider` was removed entirely.

### Middleware

Before: next-intl middleware handled locale detection and redirect for all routes, plus admin guard.

After: middleware only enforces the admin session guard. It checks for the Better Auth session cookie on any `/admin/*` request and redirects to `/auth/sign-in` if absent. All other routing is handled by Next.js natively.

```typescript
// middleware.ts — simplified
export function middleware(request: NextRequest) {
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("ariszay.session_token") ??
                          request.cookies.get("better-auth.session_token");
    if (!sessionCookie) return redirect("/auth/sign-in");
  }
  return NextResponse.next();
}
```

### `next.config.ts` update

The `next-intl` plugin wrapper was removed:

```typescript
// Before
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default withNextIntl(nextConfig);

// After
export default nextConfig;
```

---

## Phase 4 — Marketplace Redesign

**Git commit:** `2cb874d`  
**Date:** July 27, 2026

### The problem with the original structure

The original homepage showed one card for The Isle and one card for Naraka. Users had no way to tell from the homepage that each game contained multiple purchasable products. The site felt like a two-game landing page rather than a marketplace.

```
OLD STRUCTURE:
Homepage → Game card (Isle) → /cheats/the-isle (catalog)
Homepage → Game card (Naraka) → /cheats/naraka-bladepoint (catalog)
```

### New marketplace hierarchy

```
NEW STRUCTURE:
Homepage
├── Game Collections (large cards, each showing all 3 products inside)
│   ├── The Isle Collection → /games/isle
│   └── Naraka Collection  → /games/naraka
├── Featured Products (all 6 cheat tiers, grouped by game)
│   ├── The Isle Xray, Pro, Private
│   └── Naraka Xray, Pro, Private
├── Utility Tools (4 non-cheat products)
├── How ordering works
├── Why ArisZay
├── Blog
└── FAQ + Newsletter

Collection page (/games/isle)
├── Hero banner with stats (product count, starting price, last updated)
├── Product grid with filters + sort
├── Feature comparison table
├── Related blog guides
├── FAQ
└── Support CTA
```

### New data layer

`src/data/marketplace.ts` — new file with computed helpers:

```typescript
getStartingPrice(gameSlug)     // lowest monthly/lifetime price for a game
getAllGamesWithProducts()       // all games with their cheat arrays attached
getGameWithProducts(slug)      // single game with products + stats
getAllCheatProducts()           // flat list of all cheat products
tierConfig                     // visual config per tier (color, badge class, glow)
```

The `tierConfig` object is the single source of truth for tier colors:

| Tier | Color | Usage |
|---|---|---|
| Xray | Emerald `#10b981` | Badge, top bar, glow |
| Pro | Blue `#3b82f6` | Badge, top bar, glow |
| Private | Purple `#8b5cf6` | Badge, top bar, glow, "Most Popular" |

### New components

**`GameCollectionCard`** (`src/components/marketplace/game-collection-card.tsx`):
- Accent gradient header with radial glow behind game name
- Starting price displayed prominently
- Product count and "Active development" badges
- Three-column mini grid showing each cheat tier (with tier badge, name, price, status dot)
- Each mini tile is a clickable link to its tier detail page
- "Explore Collection" button → `/games/[slug]`

**`MarketplaceProductCard`** (`src/components/marketplace/marketplace-product-card.tsx`):
- Color-coded top accent bar per tier
- "Most Popular" badge for Private tier
- Tier subtitle badge (CORE ESP / AIM ASSIST / FULL AIMBOT)
- Compact status dot
- Price block with monthly and lifetime if available
- Product description (2 lines, truncated)
- 4 key features with checkmarks
- Feature count overflow ("+N more features")
- Dual CTA: View Details + Buy Now

**`GameProductGrid`** (`src/components/marketplace/game-product-grid.tsx`):
- Client component — uses `useState` + `useMemo`
- Filter bar: All Tiers / Xray / Pro / Private
- Optional game filter (shown on homepage, hidden on collection page)
- Sort controls: Featured / Price Low to High / Price High to Low
- Results count display
- Empty state with "Clear filters" button

### Homepage redesign

**Visual hierarchy of the new homepage:**

1. **Marketplace hero** — gradient headline, CTA buttons, stats strip (total products, supported games, instant delivery)
2. **Game Collections** — two `GameCollectionCard` components side by side; each shows all 3 purchasable tiers inside
3. **Featured Products** — all 6 cheat tiers, grouped by game with "See full collection" links; each rendered as `MarketplaceProductCard`
4. **Utility Tools** — 4 non-cheat products in a compact grid with icon, name, price, top 3 features
5. **How ordering works** — 4-step numbered process
6. **Why ArisZay** — 4 benefit cards (status, delivery, support, checkout)
7. **Latest guides** — 3 most recent blog posts
8. **FAQ + Support** — accordion FAQ alongside support info card
9. **Newsletter** — email subscription form

### Collection pages (`/games/isle`, `/games/naraka`)

Each game collection page now serves as the primary product browsing experience for that game:

- **Hero** with accent gradient, game name, stats row, main CTAs (Get Private / Compare tiers)
- **Game info card** (genre, developer, platform, availability notice)
- **Overview text** (2 paragraphs about the game and ArisZay's tools)
- **Filterable product grid** — all 3 tiers, filterable by tier, sortable by price
- **Feature comparison table** — full Xray/Pro/Private matrix with links to each tier detail page
- **Related guides** — blog posts filtered by game
- **Game-specific FAQ** — questions relevant to that game only
- **Support CTA** — card linking to all tiers and FAQ

### Data-driven extensibility

Adding a new game to `src/data/games.ts` and its cheats to `src/data/cheats.ts` automatically populates:

- Homepage game collections grid
- Homepage featured products grid
- Navigation header dropdown
- Sitemap
- Product filters
- Collection pages

No page or component code needs to change.

---

## Phase 5 — Docker & Local Development

**Git commit:** `bd8db1e`  
**Date:** July 27, 2026

### Docker setup

The project uses Docker for local PostgreSQL only. The application itself (Next.js) runs directly with `pnpm dev`, not inside Docker.

`docker-compose.yml` defines a single service:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: ariszay-db
    ports:
      - "5433:5432"   # host:container
    environment:
      POSTGRES_USER: ariszay
      POSTGRES_PASSWORD: ariszay_dev_password
      POSTGRES_DB: ariszay
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
```

Data is persisted in a named Docker volume (`postgres_data`) so the database survives container restarts.

### The port 5432 conflict and why it was changed

The initial configuration mapped host port `5432` to the container's internal port `5432`. This failed with:

```
Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Root cause:** macOS systems running Homebrew PostgreSQL or Postgres.app have a native PostgreSQL process already listening on port 5432. Docker cannot bind a port that the OS has already allocated to another process.

**Decision:** Start the project's own isolated container on host port `5433` instead of trying to share or replace the system PostgreSQL. This is the correct approach because:

1. The system PostgreSQL may be used by other projects — overwriting it or stopping it would break them
2. Using different credentials (separate `ariszay` user and `ariszay` database) keeps the project self-contained
3. Future developers can follow the same setup without assuming a clean machine

**Files changed:**

| File | Before | After |
|---|---|---|
| `docker-compose.yml` | `"5432:5432"` | `"5433:5432"` |
| `.env.local` | `localhost:5432` | `localhost:5433` |
| `.env.example` | `localhost:5432` | `localhost:5433` |

The container's internal port remains 5432 (this is how PostgreSQL operates inside the container). Only the host-side binding changed.

### Prisma workflow

```bash
# Generate Prisma Client from schema
pnpm prisma generate

# Push schema to database (dev — no migration files)
pnpm prisma db push

# Open Prisma Studio (database GUI)
pnpm prisma studio

# Seed initial data (games, products, admin user)
pnpm db:seed
```

### Environment variables

All sensitive configuration is in `.env.local` (git-ignored). `.env.example` is committed to git as a reference template.

Required variables for local development:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://ariszay:ariszay_dev_password@localhost:5433/ariszay
BETTER_AUTH_SECRET=<minimum 32 characters>
BETTER_AUTH_URL=http://localhost:3000
SEED_ADMIN_EMAIL=admin@localhost.local
SEED_ADMIN_PASSWORD=AdminPassword!dev123
SEED_ADMIN_NAME=Admin
```

SMTP variables are optional in development — emails fall back to console output.

### Full local development workflow

```bash
# 1. Start the database
docker compose up -d

# 2. Install dependencies (only needed once / after package.json changes)
pnpm install

# 3. Generate Prisma Client
pnpm prisma generate

# 4. Sync schema to database
pnpm prisma db push

# 5. Seed initial data
pnpm db:seed

# 6. Start the dev server
pnpm dev

# Site is running at http://localhost:3000
# Admin is at http://localhost:3000/admin
```

---

## Current Architecture

### Frontend

Built with Next.js 15 App Router using a mix of Server and Client components:

- **Server components** (default) — all page-level components fetch data and render HTML server-side
- **Client components** (marked `"use client"`) — interactive components: cart drawer, checkout form, filter grid, auth forms, sign-out button, newsletter form, blog listing
- **Layouts** — single root layout at `src/app/layout.tsx` provides the persistent shell (header, footer, toast notifications)

Design system:
- **Color palette:** Deep navy background (`#0a0e1a`), dark surface (`#0d1117`), blue primary (`#3b82f6`), indigo accent (`#6366f1`)
- **Typography:** Inter (sans-serif body) + JetBrains Mono (monospace labels/badges)
- **Components:** shadcn/ui with custom dark theme overrides in `src/app/globals.css`
- **Animations:** Framer Motion — `FadeIn`, `StaggerChildren`, `StaggerItem` wrappers in `src/components/shared/motion.tsx`
- **Icons:** Lucide React

### Backend

All backend logic runs as Next.js Server Actions (`src/app/actions/`):

- `checkout.ts` — validates cart, verifies prices server-side, creates order
- `newsletter.ts` — validates email, records subscription
- `admin/orders.ts` — updates order status with audit logging

API routes (`src/app/api/`):
- `/api/auth/[...all]` — Better Auth catch-all handler (handles sign-in, sign-up, session, password reset)

### Prisma

ORM for PostgreSQL. The singleton client is instantiated in `src/lib/db.ts` using the standard Next.js pattern (storing the client on `global` in development to avoid connection pool exhaustion from hot reloads).

Schema file: `prisma/schema.prisma`  
Seed script: `prisma/seed.ts`

### Database

PostgreSQL 16 (Alpine) running in Docker locally. In production, any managed PostgreSQL service works (Supabase, Neon, Railway, RDS, etc.) — just update `DATABASE_URL`.

### Admin

Protected admin portal at `/admin`. Two-layer protection:
1. Middleware checks for session cookie presence
2. Admin layout server component verifies session + ADMIN/OWNER role

### Marketplace

Data-driven catalog:

- Static product data in `src/data/` TypeScript files (serves as the source of truth and seed data)
- Marketplace helpers in `src/data/marketplace.ts` compute derived values (starting price, product count)
- All UI sections (game cards, product cards, filters) receive data as props — no hardcoded game/product names

### SEO

- `generateMetadata()` per page
- Canonical URLs via `alternates.canonical`
- Open Graph and Twitter card tags
- JSON-LD structured data (Organization, Product, Article, BreadcrumbList)
- `/sitemap.ts` — auto-generated sitemap
- `/robots.ts` — auto-generated robots.txt
- All admin pages are excluded from indexing

### Blog

10 static posts in `src/data/blog.ts` serve as the initial content. The database `BlogPost` model is ready for CMS-managed content once the admin blog editor is built.

### Authentication

Better Auth with Prisma adapter. Sessions use HTTP-only cookies. Password hashing with bcryptjs. JWT is not used — all sessions are server-side records in the `sessions` table.

### Checkout

Cart is client-side (Zustand + localStorage). Checkout is a server action that validates inputs with Zod and verifies prices server-side. Payment provider integration is the next required step.

### Images

No image hosting is currently implemented. Product pages show a placeholder gallery (`ImageSliderPlaceholder` component). Images are modelled in the database (`ProductImage` table) and can be managed via the admin once an image upload system is added.

### Reusable components

**Shared components** (`src/components/shared/`):

| Component | Purpose |
|---|---|
| `status-badge.tsx` | Animated availability badge (Available/Updating/Unavailable/Unknown), supports compact mode |
| `cheat-card.tsx` | Compact cheat tier card for catalog pages |
| `game-card.tsx` | Simple game card (used on older pages) |
| `product-card.tsx` | Simple product card |
| `detail-sections.tsx` | Reusable sections for tier detail pages (hero, pricing cards, features, requirements) |
| `feature-comparison-table.tsx` | Three-column Xray/Pro/Private comparison matrix |
| `glass-card.tsx` | Glassmorphism-style card wrapper |
| `section-heading.tsx` | Standardized section title + description |
| `json-ld.tsx` | JSON-LD structured data injector |
| `motion.tsx` | Framer Motion animation wrappers |
| `faq-accordion.tsx` | Accordion FAQ list |
| `buy-button.tsx` | CTA button that links to checkout |
| `newsletter-form.tsx` | Email subscription form |

**Marketplace components** (`src/components/marketplace/`):

| Component | Purpose |
|---|---|
| `game-collection-card.tsx` | Large game collection card with product preview grid |
| `marketplace-product-card.tsx` | Rich individual product card with tier badge, price, features, dual CTA |
| `game-product-grid.tsx` | Client-side filterable and sortable product grid |

---

## Folder Structure

```
ariszay/
├── prisma/
│   ├── schema.prisma         # Full database schema (20+ models)
│   └── seed.ts               # Seeds games, products, and admin user
│
├── public/                   # Static assets
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout: <html>, <body>, fonts, header, footer
│   │   ├── page.tsx          # Homepage — marketplace hub
│   │   ├── globals.css       # Global CSS: Tailwind imports, CSS variables, design tokens
│   │   ├── sitemap.ts        # Dynamic sitemap generator
│   │   ├── robots.ts         # robots.txt generator
│   │   │
│   │   ├── account/          # Customer account dashboard (auth-gated)
│   │   ├── admin/            # Admin portal (auth + role gated)
│   │   │   ├── layout.tsx    # Admin shell with sidebar and header
│   │   │   ├── page.tsx      # Dashboard with aggregate stats
│   │   │   ├── orders/       # Order management
│   │   │   ├── products/     # Product management
│   │   │   ├── games/        # Game management
│   │   │   ├── customers/    # Customer list
│   │   │   ├── coupons/      # Coupon management
│   │   │   ├── referrals/    # Referral tracking
│   │   │   ├── content/      # Blog posts and FAQs
│   │   │   └── users/        # Admin user management
│   │   │
│   │   ├── api/
│   │   │   └── auth/[...all] # Better Auth API handler
│   │   │
│   │   ├── auth/             # Authentication pages
│   │   │   ├── sign-in/
│   │   │   ├── sign-up/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── blog/             # Blog listing and individual posts
│   │   │   └── [slug]/
│   │   │
│   │   ├── cheats/           # Cheat catalog and tier detail
│   │   │   └── [gameSlug]/
│   │   │       └── [tier]/
│   │   │
│   │   ├── checkout/         # Checkout form and success page
│   │   │   └── success/
│   │   │
│   │   ├── games/            # Game collection pages
│   │   │   └── [slug]/
│   │   │
│   │   ├── legal/            # Terms, Privacy, Refund
│   │   │   └── [page]/
│   │   │
│   │   ├── products/         # Utility product detail pages
│   │   │   └── [slug]/
│   │   │
│   │   ├── ref-links/        # Internal checkout route reference (noindex)
│   │   │
│   │   └── actions/          # Next.js Server Actions
│   │       ├── checkout.ts
│   │       ├── newsletter.ts
│   │       └── admin/orders.ts
│   │
│   ├── components/
│   │   ├── admin/            # Admin-specific components
│   │   ├── auth/             # Auth buttons, sign-out
│   │   ├── blog/             # Blog listing client component
│   │   ├── cart/             # Cart drawer
│   │   ├── layout/           # SiteHeader and SiteFooter
│   │   ├── marketplace/      # Game collection card, product card, product grid
│   │   ├── shared/           # Reusable UI components
│   │   └── ui/               # shadcn/ui primitives
│   │
│   ├── config/
│   │   ├── site.ts           # siteConfig: name, description, URL, metadata
│   │   └── ref-links.ts      # Helper to generate checkout URLs per product
│   │
│   ├── data/                 # Static product catalog (TypeScript)
│   │   ├── blog.ts           # 10 static blog posts
│   │   ├── cheats.ts         # 6 cheat products (2 games × 3 tiers)
│   │   ├── faq.ts            # FAQ items (global and per-game)
│   │   ├── features-by-tier.ts  # Feature lists and pricing per tier
│   │   ├── games.ts          # 2 games with slugs, colors, descriptions
│   │   ├── marketplace.ts    # Computed helpers (starting price, stats)
│   │   └── products.ts       # 4 utility products
│   │
│   ├── lib/
│   │   ├── auth.ts           # Better Auth server configuration
│   │   ├── auth-client.ts    # Better Auth client exports
│   │   ├── auth-server.ts    # Server-side session helper (getServerSession)
│   │   ├── db.ts             # Prisma client singleton
│   │   ├── rate-limit.ts     # In-memory rate limiter
│   │   ├── utils.ts          # cn() utility (clsx + tailwind-merge)
│   │   └── email/
│   │       ├── send.ts       # Nodemailer send abstraction
│   │       └── templates.ts  # HTML email templates
│   │
│   ├── store/
│   │   └── cart.ts           # Zustand cart store (persisted to localStorage)
│   │
│   ├── types/
│   │   └── index.ts          # Shared TypeScript types
│   │
│   └── env.ts                # Zod environment variable validation
│
├── middleware.ts              # Admin session guard
├── next.config.ts             # Next.js config + security headers
├── docker-compose.yml         # PostgreSQL container (host port 5433)
├── .env.example               # Template for .env.local
├── .env.local                 # Local secrets (git-ignored)
├── components.json            # shadcn/ui configuration
├── tsconfig.json              # TypeScript configuration
├── postcss.config.mjs         # PostCSS (Tailwind)
├── eslint.config.mjs          # ESLint flat config
└── prettier.config.mjs        # Prettier configuration
```

---

## Marketplace Data Flow

```
src/data/games.ts
  │  Defines: Game objects (slug, cheatsSlug, name, accent, tagline)
  │
  ↓
src/data/cheats.ts
  │  Defines: 6 Cheat objects built from games × tiers
  │  Each cheat has: game slug, tier, name, description, price, status,
  │                  highlight features, full feature count, system requirements
  │
  ↓
src/data/marketplace.ts
  │  Computes: GameWithProducts (game + attached cheats + startingPrice + productCount)
  │  Exports: tierConfig (colors per tier)
  │
  ↓
src/app/page.tsx (Homepage)
  │  getAllGamesWithProducts() → renders <GameCollectionCard> per game
  │  getAllCheatProducts() → renders <MarketplaceProductCard> per cheat (grouped by game)
  │  products (from data/products.ts) → renders utility tool cards
  │
  ↓
/games/[slug] (Collection page)
  │  getGameWithProducts(slug) → renders <GameProductGrid> (filterable)
  │  Full comparison table, FAQ, related guides, support CTA
  │
  ↓
/cheats/[gameSlug] (Cheat catalog)
  │  getGameByCheatsSlug(gameSlug) → game info
  │  getCheatsByGame(game.slug) → renders 3 <CheatCard> components
  │
  ↓
/cheats/[gameSlug]/[tier] (Tier detail)
  │  getCheatByGameAndTier(game, tier) → full cheat data
  │  Renders: hero, pricing, features, system requirements, comparison table
  │  Both pricing cards link to /checkout?product=[game]-[tier]
  │
  ↓
/checkout (Cart + order form)
  │  Cart items from Zustand store
  │  createOrder() server action validates + creates Order + OrderItems in DB
  │
  ↓
/checkout/success
     Order record in database
     Email queued to customer (license + setup guide)
     Admin can view and update order at /admin/orders/[id]
```

---

## Features Implemented

### Foundation
- [x] Next.js 15 with App Router and TypeScript
- [x] Tailwind CSS v4 with custom design tokens
- [x] shadcn/ui component library with dark theme
- [x] ESLint + Prettier with consistent configuration
- [x] Zod environment variable validation at startup
- [x] pnpm workspace configuration

### Design System
- [x] Premium dark palette (deep navy, dark charcoal, blue/indigo accents)
- [x] Inter + JetBrains Mono font pairing
- [x] Framer Motion animation wrappers
- [x] Glassmorphism card component
- [x] Responsive layout (mobile, tablet, desktop)
- [x] Sticky header with scroll blur effect
- [x] Dark mode (forced dark, no toggle needed)

### Product Catalog
- [x] 2 games (The Isle, Naraka: Bladepoint)
- [x] 3 cheat tiers per game (Xray, Pro, Private) — 6 cheat products total
- [x] 4 utility products (UGC, Skin Changer, Cloud DMA, HWID Spoofer)
- [x] Tier feature lists (16/31/56 features per tier)
- [x] Per-game system requirements per tier
- [x] Product descriptions, long descriptions
- [x] Monthly and lifetime pricing
- [x] Availability status badges (Available / Updating / Unavailable / Unknown)
- [x] Status badge compact mode for mini displays

### Routing & Pages
- [x] `/` — Homepage marketplace
- [x] `/games/[slug]` — Game collection page (2 pages)
- [x] `/cheats/[gameSlug]` — Cheat catalog per game (2 pages)
- [x] `/cheats/[gameSlug]/[tier]` — Tier detail (6 pages)
- [x] `/products/[slug]` — Utility product detail (4 pages)
- [x] `/blog` — Blog listing
- [x] `/blog/[slug]` — Individual blog post (10 posts)
- [x] `/checkout` — Checkout form
- [x] `/checkout/success` — Order success
- [x] `/account` — Customer account + order history
- [x] `/auth/sign-in` — Sign in page
- [x] `/auth/sign-up` — Sign up page
- [x] `/auth/forgot-password` — Password reset
- [x] `/legal/terms`, `/legal/privacy`, `/legal/refund` — Legal pages (placeholders)
- [x] `/admin` + all admin sub-routes

### Marketplace Features
- [x] Game Collection Cards (accent gradient, product preview mini-grid)
- [x] Rich Marketplace Product Cards (tier badge, price, features, dual CTA)
- [x] Filterable product grid (by tier: All/Xray/Pro/Private)
- [x] Sortable product grid (Featured/Price Low-High/Price High-Low)
- [x] Feature comparison table (3-column matrix)
- [x] Starting price computed per game
- [x] Product count computed per game
- [x] Data-driven: new game = auto-populates all sections

### Shopping Cart
- [x] Zustand cart store with localStorage persistence
- [x] Cart drawer (slide-in from header)
- [x] Add, remove, update quantity
- [x] Coupon code field (stored in cart state)
- [x] Referral code field (stored in cart state)
- [x] Cart item count badge on header icon

### Checkout & Orders
- [x] Checkout form (name, email, Discord, coupon, referral)
- [x] Server-side price validation (cannot submit manipulated prices)
- [x] Order creation server action
- [x] Guest checkout (email stored on order)
- [x] Order record with status workflow (PENDING → PAID → DELIVERED)
- [x] Order success page with order ID
- [x] Customer account page with order history

### Authentication
- [x] Email/password sign-up
- [x] Email/password sign-in
- [x] Session management (HTTP-only cookies)
- [x] Forgot password flow
- [x] Sign-out button
- [x] Auth buttons in header (dynamic: sign in / account icon)
- [x] Role-based access control (6 roles)

### Admin Portal
- [x] Dashboard with order and revenue stats
- [x] Order list with status display
- [x] Order detail view with status update form
- [x] Product list
- [x] Game list
- [x] Customer list
- [x] Coupon list
- [x] Referral list
- [x] Content management (blog/FAQ list)
- [x] Admin user list
- [x] Middleware protection (session cookie check)
- [x] Layout-level role check
- [x] Admin sidebar and header components

### SEO
- [x] `generateMetadata()` on all pages
- [x] Canonical URLs
- [x] Open Graph tags
- [x] Twitter card tags
- [x] Organization structured data (JSON-LD)
- [x] Product structured data (JSON-LD)
- [x] Article structured data (JSON-LD)
- [x] BreadcrumbList structured data (JSON-LD)
- [x] Dynamic sitemap (`/sitemap.xml`)
- [x] robots.txt (`/robots.txt`)
- [x] Admin pages excluded from search indexing

### Blog
- [x] 10 static blog posts
- [x] Category filter (All / Isle / Naraka)
- [x] Search by keyword
- [x] Table of contents (auto-generated from headings)
- [x] Related posts section
- [x] Reading time display
- [x] Author and publish date

### Infrastructure
- [x] PostgreSQL via Docker (host port 5433, avoids system conflicts)
- [x] Prisma schema with 20+ models
- [x] Database seeding script
- [x] In-memory rate limiter
- [x] Nodemailer email abstraction (SMTP provider-agnostic)
- [x] HTML email templates for transactional emails
- [x] HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
- [x] Environment validation (fails loudly on missing secrets)

---

## Remaining Roadmap

### Short-term (Next 2–4 weeks)

- [ ] **Payment provider integration** — Connect Stripe or Coinbase Commerce; implement webhook for order status updates
- [ ] **License key delivery** — Generate and email license key after payment confirmation
- [ ] **Admin product editor** — Create/edit product details, pricing plans, and feature lists from the admin portal
- [ ] **Admin blog editor** — Rich text editor for creating blog posts in the CMS rather than static TypeScript files
- [ ] **Image upload** — Admin UI for uploading product screenshots; store in S3, Cloudflare R2, or Supabase Storage
- [ ] **Legal pages** — Replace placeholder content with actual Terms of Service, Privacy Policy, and Refund Policy
- [ ] **Email verification** — Require email verification before account activation
- [ ] **Customer license dashboard** — Show purchased licenses and download links in `/account`

### Medium-term (1–3 months)

- [ ] **Analytics dashboard** — Daily/monthly revenue, order counts, conversion funnel in admin
- [ ] **Coupon management UI** — Create and deactivate coupons from admin (currently read-only list)
- [ ] **Referral management UI** — Issue and manage referral codes from admin
- [ ] **Admin product status toggle** — Change product availability (Available/Updating/Unavailable) from admin without a deploy
- [ ] **Audit log viewer** — View `AuditLog` records in admin for compliance and debugging
- [ ] **Customer search** — Search customers by email in admin
- [ ] **Order search and filtering** — Filter orders by status, date, and amount in admin
- [ ] **Automated patch status updates** — Webhook or scheduled job to update product status when game patches drop
- [ ] **Discord notification** — Post to a Discord webhook when a new order is placed

### Long-term (3–6 months)

- [ ] **Additional games** — Expand catalog to a third game; all UI sections populate automatically due to data-driven architecture
- [ ] **License key system** — Generate, store, and revoke license keys per order; integrate with loader authentication
- [ ] **Subscription management** — Handle monthly recurring billing, auto-renewal, and cancellation
- [ ] **Customer self-service** — Extend `/account` to allow password change, Discord update, and subscription management
- [ ] **Affiliate program** — Full referral partner dashboard with payout tracking
- [ ] **Multi-currency** — Display prices in local currencies using exchange rates
- [ ] **Product bundles** — Allow purchasing multiple tiers as a bundle at a discount

### Performance

- [ ] Enable Partial Prerendering (PPR) for pages that mix static and dynamic content
- [ ] Add `<Image>` component for all product images with proper `srcset`
- [ ] Implement CDN caching for static assets
- [ ] Move blog content to database and implement ISR (Incremental Static Regeneration)

### Security

- [ ] Implement CSRF protection on server actions
- [ ] Add two-factor authentication (TOTP) for admin accounts
- [ ] Implement IP-based rate limiting using Redis (replace in-memory rate limiter for multi-instance deployments)
- [ ] Add webhook signature verification for payment provider callbacks
- [ ] Regular dependency audit (`pnpm audit`)

### Payments

- [ ] Connect Stripe (cards, PayPal) or Coinbase Commerce (crypto)
- [ ] Implement webhook endpoint at `/api/webhooks/payment`
- [ ] Automatic order status update on payment confirmation
- [ ] Refund processing from admin order detail page
- [ ] Invoice PDF generation and email delivery

### Admin improvements

- [ ] Game banner and logo upload
- [ ] Product drag-and-drop sort order
- [ ] Bulk order status update
- [ ] CSV export for orders and customers
- [ ] Admin activity feed (recent orders, registrations)
- [ ] Product archiving (soft delete, preserves order history)

### Monitoring

- [ ] Error tracking (Sentry integration)
- [ ] Uptime monitoring
- [ ] Slow query monitoring via Prisma's `query` events
- [ ] Health check endpoint at `/api/health`

---

## Lessons Learned

### 1. Avoid premature internationalization

Adding `next-intl` before there was any actual multilingual content created significant routing complexity with no benefit. The locale prefix (`/en/`) broke all internal links and confused users. For single-language projects, defer i18n until it is genuinely required.

### 2. Never use external links for purchase CTAs on the same website

The original implementation linked "Get Cheats" buttons to placeholder external payment provider URLs (`https://payment-provider.com/...`). This caused all purchase CTAs to open unknown external pages, breaking user trust and functionality. All purchase flows must route through internal pages (`/checkout`) even while the payment provider is not yet integrated.

### 3. Root layout must own `<html>` and `<body>` in Next.js 15

Next.js 15 strictly requires the absolute root layout at `src/app/layout.tsx` to contain the `<html>` and `<body>` tags. Nested layouts (like the old locale layout) must not contain these tags. Violating this causes a runtime error on every navigation.

### 4. Docker port allocation should not assume a clean machine

Development machines often have PostgreSQL running via Homebrew, Postgres.app, or other Docker projects. Assuming port 5432 is free will fail for most developers. Mapping to a project-specific port (5433 for this project) prevents conflicts without affecting functionality.

### 5. Fake statistics and false claims erode trust

Early versions included "26,000+ customers," fake star ratings, and "Undetected guaranteed" badges. These were removed because:
- They are unverifiable and legally problematic
- Technically sophisticated users (the target audience) immediately recognize them as fake
- Honest status badges ("Available," "Updating") and real product counts build more trust than inflated numbers

### 6. Data-driven architecture pays off immediately

Building the product catalog as TypeScript data files (`src/data/`) that feed all UI sections means that a new game can be added by editing two files. The homepage, navigation, filters, sitemap, and collection pages all update automatically. This architecture decision prevented significant duplication and will continue to pay off as the catalog grows.

### 7. Server-side price validation is non-negotiable

Accepting prices from the client (e.g., from cart state) would allow any user to manipulate the checkout total. The `createOrder` server action always looks up prices from the database using the product ID and plan ID submitted by the client. The client total is ignored — the server recomputes it.

### 8. pnpm native build scripts require explicit allowlisting

pnpm enforces a security model where native build scripts (for packages like `@swc/core`, `@parcel/watcher`) must be explicitly allowed in `pnpm-workspace.yaml`. Omitting this causes silent failures where native binaries are not compiled and the dev server crashes with cryptic errors.

---

## Current Status

### Executive Summary

As of July 27, 2026, ArisZay is a **fully functional gaming enhancement software marketplace** with a complete frontend, backend, database schema, and admin portal. The application is production-ready from an architecture standpoint, with one critical missing piece: **payment processing**.

### What works end-to-end today

- All 16 public routes render correctly with no 404 errors
- All 6 cheat product pages and 4 utility product pages are complete
- Authentication (sign-up, sign-in, forgot password, sessions) works
- Cart persists across page loads; checkout form validates and creates order records
- Admin portal is accessible and displays live data from the database
- SEO metadata, sitemaps, and structured data are in place
- Security headers are applied to all responses
- Email infrastructure is wired up and falls back to console in development

### What is not yet production-ready

1. **No payment integration** — Orders are created but no money is collected. The checkout redirects to a placeholder URL. This is the single blocking item before the store can process real transactions.
2. **No license delivery** — After a hypothetical payment, no automated system sends license keys to customers.
3. **Legal pages are placeholders** — Terms of Service, Privacy Policy, and Refund Policy pages display placeholder text.
4. **No product images** — Image gallery placeholders are shown on all product pages.
5. **Static blog content** — Blog posts are hardcoded in TypeScript; the admin blog editor is not yet built.
6. **Admin is read-only in most sections** — Order status can be updated, but products, coupons, games, and users cannot be edited from the admin UI yet.

### Tech debt

- `next-intl` is still listed in `package.json` dependencies but is no longer used. It can be removed with `pnpm remove next-intl` without any code changes.
- The in-memory rate limiter (`src/lib/rate-limit.ts`) will not work correctly if the application is deployed across multiple instances. It must be replaced with a Redis-backed solution before horizontal scaling.

### Deployment readiness

The application can be deployed to Vercel, Railway, or any Node.js host today. Required before going live:

1. Set all environment variables in the hosting platform
2. Point `DATABASE_URL` to a managed PostgreSQL service
3. Run `pnpm prisma db push` and `pnpm db:seed` on the production database
4. Integrate a payment provider and update `src/config/ref-links.ts` and `src/app/actions/checkout.ts`
5. Replace legal page placeholder content
6. Configure SMTP credentials for transactional email delivery

---

*This document was generated from the project's git history, source code, and Prisma schema. All features described are implemented in the current codebase unless explicitly marked as pending.*
