# MDM monorepo

Master data management apps, built on the SagUI design system.

## Apps

- `apps/web`: MDM admin
- `apps/onboarding`: invite-only vendor onboarding
- `apps/vendor-portal`: vendor portal
- `apps/sagui-docs`: SagUI documentation
- `apps/sagui-storybook`: SagUI Storybook

## Packages

- `packages/sagui-ui`: SagUI components (`@sagui/ui`)
- `packages/sagui-tokens`: design tokens (`@sagui/tokens`)
- `packages/sagui-mcp`: SagUI MCP server (`@sagui/mcp`)
- `packages/vendor-onboarding`: shared vendor data and types

## Using components

```tsx
import { Button } from "@sagui/ui";
```

Rules for UI work are in `packages/sagui-ui/AGENTS.md`.
