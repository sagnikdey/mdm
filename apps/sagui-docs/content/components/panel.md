---
title: Panel
slug: panel
description: "A plain surface for forms, details and any other content."
category: cards
component: Panel
keywords:
  - panel
  - surface
  - container
  - section
  - form container
---

A plain surface for forms, details and any other content.

<!-- demo: Hero -->

## When to use

- Grouping a form or a block of details on a page.
- Any surface whose content is yours to compose.

## When not to use

- Use card for a titled summary with media, a byline or a quick look.
- Use metric-card for a single number with context.

## Usage

```tsx
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@sagui/ui";

export function Details() {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Banking</PanelTitle>
      </PanelHeader>
      <PanelContent>Account ending 4821</PanelContent>
    </Panel>
  );
}
```

## Examples

### With an action

<!-- demo: WithAction -->

## API reference

### Panel

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `elevation` | `"flat" \| "resting" \| "raised"` | `"flat"` | Shadow under the surface. |
| `as` | `"div" \| "section" \| "article" \| "aside" \| "form"` | `"div"` | Element to render. |

### PanelHeader

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `action` | `ReactNode` | – | Controls aligned to the end of the header. |

### PanelTitle

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `"h2" \| "h3" \| "h4"` | `"h3"` | Heading level, so the panel fits the page outline. |

`PanelDescription`, `PanelContent` and `PanelFooter` take the standard attributes of their elements.

## Accessibility

- Set `as` to a landmark and give it a name with `aria-labelledby` when the panel is a page section.
- Choose the `PanelTitle` level that fits the page outline.

## Related

- [Card](/components/card): A contained group of related content and actions.
