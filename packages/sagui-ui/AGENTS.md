# SagUI — rules for AI agents

These rules are always on. For anything not covered here, ask the `sagui` MCP server.

## Before writing UI
1. Check what exists: `search_components` (by intent) or `list_components`.
2. Get the real API with `get_component` before using a component. Use only the props it returns.
3. Run `validate_usage` on your finished code.

## Non-negotiables
- Import from the package: `import { Button } from "@sagui/ui";` and load `@sagui/ui/styles.css` once.
- Never hardcode color (hex, rgb, oklch). Use semantic tokens: `bg-background`, `bg-surface`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary text-primary-foreground`, `bg-destructive`, `text-success`, `text-warning`, `ring-ring`. Charts use `var(--color-chart-1…4)`.
- Components use semantic tokens only, never `--sg-*` primitives.
- Radius: use roles: `--radius-control` (inputs, buttons), `--radius-container` (cards), `--radius-overlay` (dialogs, popovers), `--radius-pill`. Nested corners stay concentric: inner = outer − padding.
- Elevation: `--shadow-resting | raised | floating | overlay`. No custom box-shadows.
- Type: Inter for UI, JetBrains Mono for code; sizes `text-xs` … `text-6xl`. No arbitrary font sizes.
- Motion: durations and easings come from tokens (`--duration-*`, `--ease-*`) or `@sagui/tokens/motion`. Respect reduced motion.
- Dark mode is `[data-theme="dark"]`; tokens switch automatically, so never write separate dark colors.
- No arbitrary px utilities (`p-[13px]`). Use the Tailwind spacing scale.
- One primary button per view. Use links for navigation (`<Button asChild>` to keep the look).
- Don't create a new component if a SagUI one fits. If none does, compose existing ones and say so.
