# Zion Shop

Modern white-label fashion e-commerce platform for Bangladesh.

Built with Next.js 15, Supabase, Prisma, and Tailwind v4.
Designed to be sold as a complete, ready-to-deploy solution to small fashion retailers.

## Status

**Phase 0: Setup & Planning** — scaffolding in progress.

See [`ZION_SHOP_PROJECT_PLAN.md`](./ZION_SHOP_PROJECT_PLAN.md) for the full 10-phase roadmap, schema design, and payment integration plan.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Supabase Postgres + Prisma ORM
- **Auth:** Supabase Auth
- **Storage:** Cloudinary (product images)
- **State:** Zustand (cart) + React Hook Form + Zod
- **Payments:** bKash, SSLCommerz, Cash on Delivery
- **Email:** Resend
- **Hosting:** Vercel

## Local development

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env template and fill in values
cp .env.example .env.local

# 3. Generate Prisma client and apply migrations
pnpm db:migrate

# 4. Run dev server
pnpm dev
```

Open http://localhost:3000 — you should see the Zion Shop "Coming Soon" page.

Visit http://localhost:3000/api/health to verify the server is running.

## Folder structure

```
app/
  (shop)/       Public storefront pages
  (auth)/       Login, signup, forgot-password
  (account)/    Customer dashboard
  admin/        Admin panel
  api/          Route handlers (REST + webhooks)
components/
  ui/           shadcn/ui primitives
  shop/         Storefront components
  admin/        Admin components
lib/
  prisma.ts     Prisma client singleton
  supabase/     Browser + server Supabase clients
  utils.ts      cn(), formatBDT(), etc.
prisma/
  schema.prisma Database schema
types/
  index.ts      Shared domain types
```

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TS type-check, no emit |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:migrate` | Create + apply migration (dev) |
| `pnpm db:deploy` | Apply pending migrations (prod) |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Run seed script (added in Phase 1) |

## License

Proprietary — see future `LICENSE` file (Phase 8).
