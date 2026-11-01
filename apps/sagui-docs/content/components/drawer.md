---
title: Drawer
slug: drawer
description: "A temporary side surface for focused work."
category: overlays
component: Drawer
keywords:
  - overlay
  - surface
  - react drawer
  - side panel
  - slide over panel
  - sheet component
  - draggable drawer
  - radix dialog drawer
  - filters drawer
---

A temporary side surface for focused work.

<!-- demo: Hero -->

## When to use


- Side panels for filters, settings, or record details that keep the page in context.
- Forms that are too long for a dialog but should not leave the current view.
- Panels from any edge, via side, with drag-to-dismiss on the header.

## When not to use


- Use dialog for short decisions and confirmations.
- Use bottom-sheet for mobile-first sheets with snap points.
- Use popover for small anchored content that does not need a modal overlay.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose } from "@sagui/ui";
import { Button } from "@sagui/ui";

export function FiltersDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild><Button variant="secondary">Filters</Button></DrawerTrigger>
      <DrawerContent title="Filters" description="Narrow the list of projects.">
        <FilterForm />
        <DrawerClose asChild><Button>Apply</Button></DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
```

## Examples

### From the left

<!-- demo: Left -->

### From the bottom

<!-- demo: Bottom -->


## API reference


### Drawer

Root. A Radix Dialog root that keeps the panel mounted while it slides out and closes it after a drag.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | – | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Initial state when uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | – | Called when the drawer opens or closes. |
| `...props` | `ComponentPropsWithoutRef<typeof DialogPrimitive.Root>` | – | Other Radix Dialog root props, such as modal and children. |

### DrawerTrigger

Radix Dialog.Trigger. Use asChild to wrap your own button.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>` | – | Radix trigger props, including asChild. |

### DrawerContent

Overlay and panel with a titled header that doubles as the drag handle, a close button, and a scrolling body.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `string` | – | Rendered as the dialog title. A new title rises in while open. |
| `description` | `string` | – | Rendered as the dialog description under the title. |
| `side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | Edge the panel attaches to and slides from. |
| `children` (required) | `ReactNode` | – | Body content. |
| `...props` | `ComponentPropsWithoutRef<typeof DialogPrimitive.Content>` | – | Radix content props such as className, onInteractOutside, and onEscapeKeyDown. |

### DrawerClose

Radix Dialog.Close for extra close buttons in the body or footer.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ComponentPropsWithoutRef<typeof DialogPrimitive.Close>` | – | Radix close props, including asChild. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Escape | Closes the drawer and returns focus to the trigger. |
| Tab / Shift+Tab | Cycles focus within the panel while it is open. |

## Accessibility


- Radix Dialog provides role="dialog", aria-modal, focus trapping, and focus return.
- title and description are wired to Dialog.Title and Dialog.Description, so the panel is always named.
- The header close button is labelled "Close drawer"; dragging is optional and never the only way to close.

## Motion


- The panel springs in from its edge and leaves faster on a tween; a drag past a third of the panel or a quick flick closes it and keeps the release velocity.
- Dragging the header away from the edge rubber-bands; the overlay fades in and out.
- Reduced motion disables dragging and replaces the slide with a short opacity fade.

## Responsive behavior


- Left and right panels are min(30rem, 100vw minus a gutter) wide; below 40rem they grow to nearly full width with tighter padding.
- Top and bottom panels span the full width and cap at min(32rem, 100dvh).
- The header is the drag handle with touch-action none, so a touch drag moves the panel while the body still scrolls normally.

## Performance


- The overlay uses a 4px backdrop blur, which can cost frames on low-end devices over busy pages.
- Drag runs on motion pan handlers with no React re-render per frame; the panel stays mounted only while sliding out.

## Notes


- Use for side panels with forms, filters, settings, or detail views that keep the page in context. Use dialog for short decisions and bottom-sheet for mobile-first sheets.
- Always compose Drawer as the root; under a bare Radix Dialog root the panel falls back to a static panel with no motion and no drag.
- Control open when the drawer must close after an async submit.

## Related

- [Dialog](/components/dialog): A focused surface for decisions that need attention.
- [Bottom sheet](/components/bottom-sheet): A sheet that rests at a peek or full height and follows your finger.
- [Popover](/components/popover): A small anchored surface for contextual information.
- [Button](/components/button): A clear, responsive action with quiet secondary states.
