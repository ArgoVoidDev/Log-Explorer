# ArgoCore

Modular Next.js platform with shared `/core` and domain modules under `/modules`.

## Structure

```
core/                 # Auth, UI, DB, env, shared lib
modules/
  ecommerce/          # E-commerce domain
  saas/               # SaaS domain
  portfolio/          # Portfolio domain
src/app/              # Next.js App Router entry
prisma/               # Schema & migrations
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Prisma generate + production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Prisma generate |
| `npm run db:migrate` | Prisma migrate (dev) |
| `npm run db:migrate:deploy` | Prisma migrate (prod) |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Prisma Studio |

## Getting started

```bash
cp .env.example .env
npm install
npm run db:generate
npm run dev
```

## Environment

Validated in `core/env.ts` (Zod). Production requires:

- `DATABASE_URL`
- `AUTH_SECRET` (≥32 characters)
- `NEXT_PUBLIC_SITE_URL` or `AUTH_URL`

See `.env.example`, `doc/SECURITY.md`, and `doc/DEPLOYMENT.md`.

## Deploy (Vercel)

1. Import the repo and set the env vars above in the Vercel project.
2. `vercel.json` runs Prisma generate on build and schedules:
   - `/api/cron/expire-orders` every 15 minutes
   - `/api/cron/rate-limit-gc` daily at 03:00 UTC
3. Set `CRON_SECRET` and use Vercel Cron (Authorization Bearer is sent automatically on Pro; for Hobby, protect routes with the secret header yourself).
4. Point a custom domain and set `AUTH_URL` / `NEXT_PUBLIC_SITE_URL` to that origin.
