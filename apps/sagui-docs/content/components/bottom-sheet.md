---
title: Bottom sheet
slug: bottom-sheet
description: "A sheet that rests at a peek or full height and follows your finger."
category: overlays
component: BottomSheet
keywords:
  - overlay
  - gesture
  - motion
  - react bottom sheet
  - mobile bottom sheet
  - draggable sheet
  - ios sheet
  - snap points sheet
  - detents
  - swipe up panel
---

A sheet that rests at a peek or full height and follows your finger.

<!-- demo: Hero -->

## When to use


- Mobile-first secondary tasks such as details, filters, or share options.
- Content that benefits from a peek height before expanding to nearly full screen.
- Maps and media views where the sheet should be dragged between detents.

## When not to use


- Use dialog for interrupting decisions on any screen size.
- Use drawer for side panels on wide desktop layouts.
- Use popover for small anchored content that should not dim the page.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { BottomSheet, BottomSheetClose } from "@sagui/ui";
import { Button } from "@sagui/ui";

export function TripSheet() {
  return (
    <BottomSheet
      trigger={<Button>Trip details</Button>}
      title="Lisbon, 3 nights"
      description="Oct 12 to Oct 15"
      detents={[0.4, 0.9]}
    >
      <p>Flights, hotel, and bookings.</p>
      <BottomSheetClose asChild><Button variant="secondary">Done</Button></BottomSheetClose>
    </BottomSheet>
  );
}
```

## Examples

### Three detents

<!-- demo: ThreeDetents -->


## API reference


### BottomSheet

A modal sheet that rises from the bottom edge and rests at one or more detents, with drag, flick, and keyboard control.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `string` | – | Sheet title, rendered as Dialog.Title. |
| `children` (required) | `ReactNode` | – | Scrollable sheet content. |
| `trigger` | `ReactNode` | – | Control that opens the sheet. Rendered with asChild; focus returns to it on close. |
| `open` | `boolean` | – | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Initial open state when uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | – | Called when the sheet opens or closes. |
| `description` | `string` | – | Supporting line, rendered as Dialog.Description. |
| `detents` | `number[]` | `[0.45, 0.92]` | Resting heights as fractions of the viewport height. |
| `initialDetent` | `number` | `0` | Index into the sorted detents the sheet opens at. |
| `onDetentChange` | `(index: number) => void` | – | Called when the sheet settles on a different detent. |
| `closeLabel` | `string` | `"Close"` | aria-label of the close button. |
| `className` | `string` | – | Class on the sheet surface. |

### BottomSheetClose

Radix Dialog.Close for buttons inside the sheet.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ComponentPropsWithoutRef<typeof DialogPrimitive.Close>` | – | Radix close props, including asChild. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| ArrowUp / ArrowDown | On the grabber, moves one detent up or down. |
| Home / End | On the grabber, jumps to the tallest or smallest detent. |
| Enter / Space | On the grabber, toggles between smallest and tallest detent. |
| ArrowDown / PageDown / Space | On the sheet, expands to full height first, then scrolls the content. |
| Escape | Closes the sheet. |

## Accessibility


- Built on Radix Dialog: role="dialog", focus trap, and focus return to the trigger. Initial focus lands on the sheet itself.
- The grabber is a button with aria-expanded and an Expand or Collapse sheet label.
- Detent changes are announced through a polite live region.
- Tabbing into content below the fold expands the sheet so focused elements are visible.

## Motion


- One motion value drives the sheet: drags follow the finger 1:1, rubber-band past the tallest detent, and releases project velocity to pick a detent or dismiss.
- The backdrop dim is a function of sheet position, so it tracks drags instead of running on a timer.
- Reduced motion jumps between detents and fades the sheet in and out.

## Responsive behavior


- The sheet is min(100%, 36rem) wide and detents are fractions of the dynamic viewport height, so it adapts to mobile browser chrome.
- Below 40rem the header and body use tighter side padding.
- Touch drags on the content move the sheet until it is fully open, then the content scrolls; mouse and pen drag from the header.

## Performance


- One motion value drives position and backdrop, so drags do not re-render React per frame.
- A ResizeObserver re-fits detents on viewport changes; content is not virtualized, so paginate long lists inside it.

## Notes


- Use for mobile-first secondary tasks where a peek helps: details, filters, share options. Use dialog for interrupting decisions and drawer for side panels on wide layouts.
- Pass a trigger or control open yourself. Use a single-value detents array for a fixed-height sheet.

## Related

- [Drawer](/components/drawer): A temporary side surface for focused work.
- [Dialog](/components/dialog): A focused surface for decisions that need attention.
- [Popover](/components/popover): A small anchored surface for contextual information.
