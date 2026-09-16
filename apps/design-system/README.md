# Lamplight UI (design system docs)

Live documentation site for `@workspace/ui`.

## Local dev

```bash
npm run dev:design-system
# or: npm run dev -w design-system
```

Open [http://localhost:3003](http://localhost:3003).

Port **3002** is reserved for **vendor-portal** in this monorepo.

## Vercel

Link the **lamplight-designsystem** project (or a new project) with:

- **Root Directory:** `apps/design-system`
- **Framework:** Next.js

`vercel.json` in this folder runs `turbo build --filter=design-system` from the monorepo root on install/build.

Deploy via Git push to the connected repo, or from repo root after setting Root Directory in the Vercel dashboard.

## Add a component

1. Create a demo in `components/demos/`.
2. Register it in `lib/docs-registry.ts`.
3. The nav and `/components/[slug]` page update automatically.
