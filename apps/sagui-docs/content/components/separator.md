---
title: Separator
slug: separator
description: "A thin line between groups of content."
category: data-display
component: Separator
keywords:
  - separator
  - divider
  - rule
---

A thin line between groups of content.

<!-- demo: Hero -->

## When to use

- Dividing groups in a panel, toolbar or list.

## When not to use

- Use spacing alone when the groups are already clear.

## Usage

```tsx
import { Separator } from "@sagui/ui";

<Separator />
```

## API reference

### Separator

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Direction of the line. A vertical one stretches to its row. |
| `decorative` | `boolean` | `false` | Hides the line from assistive technology when it is purely visual. |

## Accessibility

- Exposed as `role="separator"` with its orientation, or removed from the accessibility tree when decorative.

## Related

- [Panel](/components/panel): A plain surface for forms, details and any other content.
