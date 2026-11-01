---
title: Popover
slug: popover
description: "A small anchored surface for contextual information."
category: overlays
component: Popover
keywords:
  - overlay
  - menu
  - react popover
  - radix popover
  - floating panel
  - click popover
  - animated popover
  - anchored popup
---

A small anchored surface for contextual information.

<!-- demo: Hero -->

## When to use


- Click-opened panels with interactive content, like share settings or a small filter form.
- Non-modal helpers that should stay open while people interact with the rest of the page.
- Custom pickers built from your own controls anchored to a button.

## When not to use


- Use tooltip for short hover labels.
- Use hover-card for read-only previews that open on hover.
- Use dialog when the choice must block the page, and dropdown-menu for a list of commands.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@sagui/ui";
import { Button } from "@sagui/ui";

export function ShareMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild><Button variant="secondary">Share</Button></PopoverTrigger>
      <PopoverContent>
        <p>Anyone with the link can view.</p>
      </PopoverContent>
    </Popover>
  );
}
```

## Examples

### Choosing a side

<!-- demo: Sides -->


## API reference


### Popover

Radix Popover.Root. Holds open state.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | – | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Initial open state when uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | – | Called when the popover opens or closes. |
| `modal` | `boolean` | `false` | Traps focus and blocks outside interaction when true. |

### PopoverTrigger

Radix trigger that opts out of press-scale so the panel does not shift on open.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>` | – | Radix trigger props, including asChild and ref. |

### PopoverContent

Portaled floating panel anchored to the trigger.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Alignment against the trigger. |
| `sideOffset` | `number` | `6` | Gap from the trigger in px. |
| `collisionPadding` | `number` | `10` | Minimum distance from viewport edges in px. |
| `...props` | `ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>` | – | Radix content props such as side, className, and onOpenAutoFocus. |

### PopoverClose

Radix Popover.Close for an explicit dismiss button.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>` | – | Radix close props, including asChild. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / Space | Opens the popover from the trigger. |
| Escape | Closes the popover and returns focus to the trigger. |

## Accessibility


- Radix sets aria-expanded, aria-controls, and aria-haspopup="dialog" on the trigger.
- Focus moves into the content on open and back to the trigger on close.
- Content is non-modal by default; give it a heading or aria-label when it holds controls.

## Motion


- CSS transitions: the panel fades and settles from 5px toward its trigger at 0.97 scale on a spring; it leaves in 140ms.
- Transitions instead of keyframes, so a reopen mid-close reverses from where the panel is.
- Reduced motion drops the transform and keeps a short opacity fade.

## Responsive behavior


- The panel is at least 12rem and at most min(22rem, 100vw minus 20px), so it never overflows a phone screen.
- Radix collision handling keeps it 10px from viewport edges by default and flips sides when needed.

## Performance


- Pure CSS transitions with no motion runtime; content mounts in a portal only while open.

## Notes


- Use for click-opened, non-modal panels with interactive content. Use tooltip for short hover labels, hover-card for read-only previews, dialog when the choice must block.
- Compose Popover > PopoverTrigger asChild + PopoverContent. Pass side for placement.

## Related

- [Tooltip](/components/tooltip): Short supporting text for unfamiliar controls.
- [Dialog](/components/dialog): A focused surface for decisions that need attention.
