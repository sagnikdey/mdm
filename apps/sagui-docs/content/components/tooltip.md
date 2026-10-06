---
title: Tooltip
slug: tooltip
description: "Short supporting text for unfamiliar controls."
category: overlays
component: Tooltip
keywords:
  - hint
  - overlay
  - react tooltip
  - radix tooltip
  - icon button tooltip
  - hover label
  - animated tooltip
  - tooltip component
---

Short supporting text for unfamiliar controls.

<!-- demo: Hero -->

## When to use


- One-line labels on icon-only buttons in toolbars.
- Revealing the full text of truncated labels on hover or focus.
- Dense toolbars where moving between icons should show labels instantly after the first one.

## When not to use


- Use popover for anything with links or controls inside.
- Use hover-card for rich previews such as a person or link.
- Avoid it for information people must see on touch devices, where hover does not exist.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Tooltip } from "@sagui/ui";

export function ArchiveButton() {
  return (
    <Tooltip content="Archive">
      <button type="button" aria-label="Archive">
        <ArchiveIcon />
      </button>
    </Tooltip>
  );
}
```

## Examples

### Sides

<!-- demo: Sides -->

### On an icon button

<!-- demo: IconTrigger -->

### Text that changes while open

Strings crossfade and the bubble springs to its new size.

<!-- demo: ChangingText -->


## API reference


### Tooltip

A short label on hover or focus that opens without delay when moving between tooltips.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `content` (required) | `ReactNode` | – | Tooltip content. Strings and numbers crossfade and resize when they change while open. |
| `children` (required) | `ReactElement` | – | The trigger. Rendered with asChild, so it must accept a ref and be focusable. |
| `side` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Preferred side of the trigger. It flips when there is no room. |
| `className` | `string` | – | Added to the tooltip content. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Tab | Focusing the trigger opens the tooltip. |
| Escape | Closes the tooltip. |

## Accessibility


- Radix links the content to the trigger with aria-describedby and renders role="tooltip".
- Content is supplemental: icon-only triggers still need their own aria-label.
- Do not put interactive elements inside; use popover instead.

## Motion


- Opens after 250ms with a 3px rise from 0.97 scale; within 300ms of another tooltip it opens instantly with a fade only.
- Changing string content rises in with a blur while the bubble springs to the new size.
- Reduced motion removes the transform and keeps a 90ms opacity fade.

## Responsive behavior


- The bubble caps at 15rem and wraps longer text; Radix flips it to the other side near viewport edges.
- It opens on hover and keyboard focus, so touch users rarely see it; never hide essential information in one.

## Performance


- Each tooltip brings its own provider and mounts content in a portal only while open.
- A ResizeObserver measures the text only to spring the bubble size when content changes while open.

## Notes


- Use for one-line labels on icon buttons and truncated text. Use hover-card for rich previews and popover for anything interactive.
- Each Tooltip brings its own provider; no app-level wrapper is needed.

## Related

- [Popover](/components/popover): A small anchored surface for contextual information.
- [Action button](/components/action-button): A compact button for frequent toolbar actions.
