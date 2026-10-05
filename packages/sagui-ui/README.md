# SagUI

React components with motion built in. Tokens, components, Storybook and a Next.js docs site in one pnpm monorepo.

| Path | What |
|---|---|
| `packages/tokens` | `@sagui/tokens`: semantic color, type, radius, motion tokens (light + dark) |
| `packages/ui` | `@sagui/ui`: React components (Radix + CVA + Motion + Tailwind v4) |
| `apps/storybook` | Storybook 9, deployed to GitHub Pages |
| `apps/docs` | Next.js docs site |

## Develop
```bash
corepack enable
pnpm install
pnpm build              # build packages
pnpm dev:storybook      # http://localhost:6006
pnpm dev:docs           # http://localhost:3000
```

## Use in an app
```bash
npm i @sagui/ui
```
```css
/* app/globals.css */
@import "tailwindcss";
@import "@sagui/ui/styles.css";
@source "../node_modules/@sagui/ui/dist";
```
```tsx
import { Button } from "@sagui/ui";
```
Dark mode: set `data-theme="dark"` on `<html>`. All motion respects `prefers-reduced-motion`.

## Release
`pnpm changeset` → merge to `main` → the Release workflow opens a version PR and publishes to npm (needs `NPM_TOKEN` secret).

## Component checklist
Each component ships with CVA variants, focus/disabled/loading states, reduced-motion behavior, stories (default, variants, sizes, states) and passes the a11y addon in both themes.
