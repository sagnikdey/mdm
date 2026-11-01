---
title: Dialog
slug: dialog
description: "A focused surface for decisions that need attention."
category: overlays
component: Dialog
keywords:
  - modal
  - overlay
  - react dialog
  - animated modal
  - radix dialog
  - confirm dialog
  - modal window
  - popup dialog
---

A focused surface for decisions that need attention.

<!-- demo: Hero -->

## When to use


- Confirmations and decisions that must interrupt, such as Delete project.
- Short forms like rename or invite that fit in one focused panel.
- Flows where the dialog title changes between steps and should crossfade in place.

## When not to use


- Use drawer for long forms or detail panels that keep the page in context.
- Use bottom-sheet for mobile-first secondary tasks with snap heights.
- Use popover for light, non-modal content anchored to a trigger.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@sagui/ui";
import { Button } from "@sagui/ui";

export function RenameProject() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button>Rename</Button></DialogTrigger>
      <DialogContent title="Rename project" description="This changes the URL too.">
        <input defaultValue="Arc" aria-label="Project name" />
        <DialogClose asChild><Button>Save</Button></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
```

## Examples

### Controlled

Pass `open` and `onOpenChange` to open it from anywhere in your code.

<!-- demo: Controlled -->

### Copy that changes while open

The title and description reword in place, so a multi-step flow never swaps the whole surface.

<!-- demo: ChangingCopy -->


## API reference


### Dialog

Root that tracks open state so the content can animate out. Controlled or uncontrolled.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | – | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Initial open state when uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | – | Called when the dialog opens or closes. |
| `...props` | `ComponentPropsWithoutRef<typeof DialogPrimitive.Root>` | – | Other Radix Dialog root props, such as modal. |

### DialogTrigger

Radix Dialog.Trigger. Use asChild to wrap your own button.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>` | – | Radix trigger props, including asChild. |

### DialogContent

Portaled overlay and panel with a titled header and built-in close button.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `string` | – | Dialog title, rendered as Radix Dialog.Title. Changes crossfade while open. |
| `description` | `string` | – | Optional supporting line, rendered as Dialog.Description. |
| `children` (required) | `ReactNode` | – | Body content, usually a form or actions. |
| `...props` | `ComponentPropsWithoutRef<typeof DialogPrimitive.Content>` | – | Radix content props such as className, onEscapeKeyDown, and onPointerDownOutside. |

### DialogClose

Radix Dialog.Close for custom cancel or confirm buttons.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ComponentPropsWithoutRef<typeof DialogPrimitive.Close>` | – | Radix close props, including asChild. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Escape | Closes the dialog and returns focus to the trigger. |
| Tab / Shift+Tab | Cycles focus within the dialog. |

## Accessibility


- Radix renders role="dialog" with aria-modal, traps focus, and restores it to the trigger on close.
- title and description are wired to aria-labelledby and aria-describedby.
- The close button carries aria-label="Close dialog".

## Motion


- The overlay fades while the panel rises 8px and scales from 0.96 on a smooth spring; closing is shorter and retargets from the current state.
- Title and description changes rise in with a soft blur.
- Reduced motion uses a plain opacity fade.

## Responsive behavior


- The panel is min(100vw minus a 32px gutter, 440px) wide and centered, so it fits phones without extra CSS.
- Height caps at the viewport minus a gutter and the panel scrolls beyond that.

## Performance


- The overlay uses a 7px backdrop blur, which can cost frames on low-end devices over busy pages.
- Content renders in a portal only while open and unmounts after the exit animation.

## Notes


- Use for decisions that must interrupt: confirmations, short forms. Use drawer for side panels, bottom-sheet for mobile-first secondary tasks, popover for light non-modal content.
- Always compose Dialog > DialogTrigger + DialogContent. Wrap your own buttons with asChild.

## Related

- [Drawer](/components/drawer): A temporary side surface for focused work.
- [Bottom sheet](/components/bottom-sheet): A sheet that rests at a peek or full height and follows your finger.
- [Popover](/components/popover): A small anchored surface for contextual information.
