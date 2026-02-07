# Seedance Video Generation Platform

## Project Overview
A video generation SaaS platform (seedance2.work) powered by the Seedance 2.0 model.
Built on Astro + React + Cloudflare Workers + D1.

## Tech Stack
- **Framework**: Astro 5.x (SSR mode) with React 19 islands
- **Styling**: Tailwind CSS 3.x + shadcn/ui (Radix UI primitives)
- **Backend**: Cloudflare Workers (serverless)
- **Database**: Cloudflare D1 (SQLite)
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack React Table
- **Icons**: Inline SVGs + Lucide React

## Project Structure
```
src/
├── components/
│   ├── ui/          # shadcn/ui base components (Button, Card, Dialog, etc.)
│   ├── video/       # Video platform components (generate form, gallery)
│   ├── admin/       # Legacy admin components (customers, subscriptions)
│   └── Header.tsx   # Global navigation (Dashboard, Generate, Gallery, Pricing)
├── layouts/
│   └── Layout.astro # Main HTML layout with theme support
├── lib/
│   ├── services/    # Database service layer (D1 queries)
│   │   ├── video_task.ts      # VideoTaskService - CRUD for video generation tasks
│   │   ├── customer.ts        # CustomerService
│   │   ├── subscription.ts    # SubscriptionService
│   │   └── customer_subscription.ts
│   ├── api.ts       # API client utilities + auth helpers
│   └── utils.ts     # cn() helper for Tailwind class merging
├── pages/
│   ├── index.astro        # Landing page
│   ├── generate.astro     # Video generation form
│   ├── gallery.astro      # Video gallery/history
│   ├── dashboard.astro    # Stats dashboard
│   ├── pricing.astro      # Subscription plans
│   ├── api/
│   │   ├── videos/        # Video API routes
│   │   │   ├── generate.ts  # POST - create video task
│   │   │   ├── index.ts     # GET - list all tasks (auth required)
│   │   │   ├── [id].ts      # GET - single task (auth required)
│   │   │   └── stats.ts     # GET - task stats (auth required)
│   │   ├── customers.ts   # Legacy customer API
│   │   └── subscriptions.ts
│   └── admin/             # Legacy admin pages
├── styles/
│   └── globals.css  # Tailwind base + shadcn theme variables
└── workflows/       # Cloudflare Workflows (background jobs)
migrations/          # D1 SQL migration files (0001-0004)
```

## Commands
- `npm run dev` — Start dev server (runs migrations, builds, starts wrangler on :4321)
- `npm run build` — Build with Astro
- `npm run db:migrate` — Apply local D1 migrations
- `npm run db:migrate:remote` — Apply remote D1 migrations
- `npm run deploy` — Deploy to Cloudflare Workers
- `npm run check` — Build + dry-run deploy (CI check)

## Key Patterns
- **API Auth**: Bearer token or X-API-Token header, validated with timing-safe comparison
- **Database**: Raw SQL via D1 binding (`runtime.env.DB`), accessed through service classes
- **Pages**: Astro pages with React islands using `client:load` directive
- **Env access**: `Astro.locals.runtime.env` for Workers bindings in pages/API routes
- **Video generation**: POST to /api/videos/generate creates a task in D1, returns task ID

## Database Tables
- `video_tasks` — Video generation jobs (prompt, status, resolution, video_url, etc.)
- `customers` — User accounts
- `subscriptions` — Pricing plans with features
- `customer_subscriptions` — User-plan assignments with status tracking

## Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/generate` | Video generation form |
| `/gallery` | Video gallery with filters |
| `/dashboard` | Stats overview |
| `/pricing` | Subscription plans |
| `POST /api/videos/generate` | Create video task (no auth for MVP) |
| `GET /api/videos` | List all tasks (auth required) |
| `GET /api/videos/:id` | Get single task (auth required) |
| `GET /api/videos/stats` | Task statistics (auth required) |
