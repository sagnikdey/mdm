---
title: Empty state
slug: empty-state
description: "A useful next step when there is nothing to show yet."
category: cards
component: EmptyState
keywords:
  - data
  - guidance
  - react empty state
  - no results
  - empty list placeholder
  - zero state
  - blank slate
  - first run empty view
---

A useful next step when there is nothing to show yet.

<!-- demo: Hero -->

## When to use


- Empty lists, zero search results, and first-run views.
- A view that should morph between states, such as empty and success, by changing props.

## When not to use


- Use skeleton while data is still loading.
- Use alert for errors inside a page that still has content.
- Use onboarding-checklist when first-run needs several steps.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Search } from "lucide-react";
import { Button } from "@sagui/ui";
import { EmptyState } from "@sagui/ui";

export function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      icon={<Search size={24} />}
      title="No matches"
      description="Try a shorter search or clear the filters."
      action={<Button variant="secondary" onClick={onClear}>Clear filters</Button>}
    />
  );
}
```

## Examples

### No results

<!-- demo: NoResults -->

### Morphing between states

Keep the component mounted and change its props. The icon crossfades, the copy rises in, and the height springs to fit.

<!-- demo: Morphing -->


## API reference


### EmptyState

A centered icon, title, description, and optional action for empty views.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `string` | – | Headline. A new title rises in while the old one leaves. |
| `description` (required) | `string` | – | One or two sentences on why it is empty and what to do. |
| `action` | `ReactNode` | – | Call to action, usually a button. |
| `icon` | `ReactNode` | `<Folder />` | Leading icon. A different icon component crossfades in. |
| `className` | `string` | – | Class for the root section. |
| `label` | `string` | – | Accessible name for the section region. |

## Accessibility


- Renders a section with an h3 title; pass label to name the region.
- The icon is aria-hidden.
- Outgoing copy is hidden from assistive tech while it fades.

## Motion


- Changing title or description rolls the copy in place while the block height springs to fit.
- A new icon pops in with a short blur.
- Reduced motion swaps copy with a fade and snaps height; the icon's idle animation stops.

## Responsive behavior


- Padding scales with the viewport between fixed bounds, and the description caps at 18rem so lines stay short.
- Actions wrap and center, so two buttons stack on narrow screens.

## Performance


- One ResizeObserver drives the height spring; the icon's idle animation is CSS and stops under reduced motion.

## Notes


- Use for empty lists, zero search results, and first-run views. Use skeleton while data is loading.
- Keep it mounted and change its props to morph between states such as empty and success.

## Related

- [Alert](/components/alert): A persistent message that helps people recover or continue.
