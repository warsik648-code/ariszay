# ArisZay

Premium undetected gaming software marketplace — Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

**Tagline:** Premium Undetected Gaming Software

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, React 19, Turbopack) |
| Styling | Tailwind CSS v4 + ArisZay dark glass theme |
| UI | shadcn/ui + Framer Motion |
| i18n | next-intl (`en` / `zh`) |
| Env | Zod (`src/env.ts`) |
| Package manager | pnpm |

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Switch language with **EN / CN** in the header (`/zh` for Chinese).

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Development server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm typecheck` | TypeScript check |

## Key routes

- `/` — Homepage
- `/games/isle`, `/games/naraka` — Game hubs
- `/cheats/[slug]` — Cheat detail (e.g. `isle-private`)
- `/products/[slug]` — UGC, Skin Changer, Cloud DMA, HWID Spoofer
- `/blog`, `/blog/[slug]` — 10 guide posts
- `/checkout`, `/account` — Referral-driven stubs
- `/ref-links` — Operator view of payment URLs (noindex)

## Referral / payments

Configure checkout URLs in [`src/config/ref-links.ts`](src/config/ref-links.ts). Buy buttons open those links (no payment backend in this codebase).

## Environment

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical origin (no trailing slash) |

## Project structure

```text
src/
  app/[locale]/     # Localized routes
  components/       # layout, shared, ui, blog
  config/           # site + ref-links
  data/             # games, cheats, products, blog, FAQ
  i18n/             # next-intl routing
  messages/         # en.json, zh.json (repo root)
```

## License

Private — all rights reserved.
