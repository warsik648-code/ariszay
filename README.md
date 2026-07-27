# Ariszay

Production-ready Next.js 15 application foundation with TypeScript, Tailwind CSS, and shadcn/ui.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, React 19, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI | shadcn/ui (`radix-nova`, neutral base) |
| Package manager | pnpm |
| Linting / formatting | ESLint + Prettier |
| Env validation | Zod (`src/env.ts`) |

## Requirements

- Node.js 20+
- pnpm 11+ (`corepack enable` or install via npm)

## Getting started

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Start the development server (Turbopack)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm format` | Format files with Prettier |
| `pnpm format:check` | Check formatting without writing |
| `pnpm typecheck` | Run TypeScript without emitting |

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local` and adjust values.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL (no trailing slash). Used for metadata and absolute links. |

Validation lives in [`src/env.ts`](src/env.ts). Invalid or missing values fail fast at startup/build.

Never commit `.env.local` or secrets. `.env.example` is the source of truth for required keys.

## Project structure

```text
src/
  app/                 # App Router routes, layouts, metadata
  components/
    ui/                # shadcn/ui primitives
    shared/            # Cross-feature shared UI
  config/              # App configuration (site metadata, etc.)
  features/            # Domain / feature modules
  hooks/               # Shared React hooks
  lib/                 # Utilities and shared helpers
  types/               # Shared TypeScript types
  env.ts               # Zod-validated environment variables
public/                # Static assets
```

### Conventions

- Prefer the `@/` import alias (maps to `src/`).
- Put reusable primitives in `components/ui` via the shadcn CLI.
- Keep domain logic in `features/<name>` as the product grows.
- Keep server secrets out of `NEXT_PUBLIC_*` variables.

## UI components (shadcn)

```bash
pnpm dlx shadcn@latest add <component>
```

Configuration: [`components.json`](components.json).

## Production checklist

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production origin
- [ ] Run `pnpm typecheck && pnpm lint && pnpm build` before deploy
- [ ] Confirm Node 20+ on the hosting platform
- [ ] Add secrets only via the host’s environment config (never in git)

## License

Private — all rights reserved.
