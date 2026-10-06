---
title: Installation
description: "Install SagUI, set up Tailwind CSS, and render your first component."
---

## Requirements

- React 18 or newer.
- Tailwind CSS v4. Components are styled with utility classes that Tailwind generates from the package.
- A bundler or framework that handles ESM, such as Next.js or Vite.

## 1. Install the package

```bash
npm install @sagui/ui
```

The package brings its own dependencies: `motion`, Radix primitives, `lucide-react` and `tailwind-merge`. React and React DOM are peer dependencies.

## 2. Set up the styles

In the CSS entry of your app, import Tailwind and the SagUI styles, then tell Tailwind to scan the package for class names:

```css
@import "tailwindcss";
@import "@sagui/ui/styles.css";
@source "../node_modules/@sagui/ui/dist";
```

Adjust the `@source` path so it points at `node_modules/@sagui/ui/dist` from the CSS file. In a monorepo, point it at `packages/ui/src` instead.

`styles.css` carries the design tokens (colors, radii, shadows, durations, easings), the dark theme, and a few keyframes that components share.

## 3. Choose fonts

The tokens use Inter for text and JetBrains Mono for code. Load them however your app loads fonts, or override `--font-sans` and `--font-mono`.

## 4. Turn on dark mode

Dark mode is driven by a `data-theme="dark"` attribute on an ancestor, usually `<html>`. Set it from a stored preference or from `prefers-color-scheme`.

```html
<html data-theme="dark">
```

Set the attribute before first paint, with a small inline script, to avoid a flash. This site does that in its layout.

## 5. Render a component

<!-- demo: Hero -->

```tsx
import { Button } from "@sagui/ui";

export default function Page() {
  return <Button>Continue</Button>;
}
```

Components are client components. The package ships with a `"use client"` banner, so you can import them from a server component in the Next.js App Router.

## Next steps

- Read about [theming and tokens](/docs/theming) to restyle the system.
- Read about [motion](/docs/motion) to see how it is built and how reduced motion works.
- Browse the [components](/components).
