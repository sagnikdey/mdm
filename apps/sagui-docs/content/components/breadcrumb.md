---
title: Breadcrumb
slug: breadcrumb
description: "Show where a page sits in a hierarchy."
category: navigation
component: Breadcrumb
keywords:
  - navigation
  - wayfinding
  - react breadcrumb
  - breadcrumb navigation
  - animated breadcrumb
  - page path
  - nextjs breadcrumb
  - hierarchy navigation
---

Show where a page sits in a hierarchy.

<!-- demo: Hero -->

## When to use


- Showing where a page sits in a hierarchy, such as Workspace, Settings, Billing.
- Client-side paths like a file browser, where crumbs call onClick instead of navigating.
- Paths that grow as people drill in, where new crumbs should slide in.

## When not to use


- Use tree-view when people need to browse the whole hierarchy.
- Use tabs for switching between sibling views.
- Use pagination for moving through pages of a list.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Breadcrumb } from "@sagui/ui";

export function SettingsPath() {
  return (
    <Breadcrumb
      items={[
        { label: "Workspace", href: "/" },
        { label: "Settings", href: "/settings" },
        { label: "Billing" },
      ]}
    />
  );
}
```

## Examples

### Client-side path

Crumbs with `onClick` and no `href` render buttons. Crumbs added later slide in.

<!-- demo: FileBrowser -->

### Wrapping

Long paths wrap onto new lines; individual crumbs never wrap.

<!-- demo: Wrapping -->


## API reference


### Breadcrumb

A path of links where the last item is the current page. Crumbs added later slide in.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` (required) | `{ label: string; href?: string; onClick?: (event: MouseEvent<HTMLElement>) => void }[]` | – | Path from root to current page. Items with href render a link (an `a` by default, or `linkComponent`); items with only onClick render buttons. |
| `ariaLabel` | `string` | `"Breadcrumb"` | Label for the nav landmark. |
| `linkComponent` | `ElementType` | `"a"` | Element for crumbs with an href. Pass your router's Link, such as next/link. |
| `className` | `string` | – | Class for the nav element. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Tab | Moves between crumb links and buttons. |
| Enter | Follows the focused crumb. |

## Accessibility


- Renders a nav landmark with an ordered list.
- The last item is a span with aria-current="page" and is never a link.
- Chevron separators are aria-hidden.

## Motion


- Crumbs present on first render stay still; new crumbs slide in 8px from the left out of a blur while siblings shift on a smooth spring.
- Reduced motion adds and removes crumbs without movement.

## Responsive behavior


- The list wraps onto new lines on narrow screens; individual crumbs never wrap internally.
- It does not truncate or collapse long paths, so keep labels short or shorten the path on mobile yourself.

## Performance


- Crumbs use layout position animation only when the path changes; static paths do not animate.

## Notes


- Use for hierarchical page location. For client-side paths such as a file browser, pass onClick without href.
- Keep labels short; the component does not truncate or collapse long paths.

## Related

- [Tabs](/components/tabs): Switch between related content in the same context.
