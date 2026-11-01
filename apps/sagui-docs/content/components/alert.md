---
title: Alert
slug: alert
description: "A persistent message that helps people recover or continue."
category: messages
component: Alert
keywords:
  - status
  - message
  - react alert
  - alert banner
  - inline notification
  - warning message
  - animated alert
  - dismissible alert
  - callout
---

A persistent message that helps people recover or continue.

<!-- demo: Hero -->

## When to use


- Persistent, in-flow messages about a page or form, such as an expiring card.
- Status that changes over time, where one alert should morph between tones.
- Dismissible notices that should collapse and close the gap below them.

## When not to use


- Use toast for transient results of an action.
- Use empty-state when there is no content to show.
- Use dialog when people must respond before continuing.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Alert } from "@sagui/ui";

export function BillingNotice() {
  return (
    <Alert tone="warning" title="Card expires soon" onDismiss={() => track("dismissed")}>
      Update your payment method before March 1 to avoid interruption.
    </Alert>
  );
}
```

## Examples

### Tones

Info, success, warning and danger. Danger uses `role="alert"`; the others use `role="status"`.

<!-- demo: Tones -->

### Dismissible

Pass `onDismiss` to show a dismiss button. Control presence with `open`; hiding collapses the height so the content below closes the gap.

<!-- demo: Dismissible -->

### Rewording in place

A new tone morphs the icon, and new copy rises in while the height follows on a spring.

<!-- demo: Rewording -->


## API reference


### Alert

An inline message with a tone icon, title, and optional details that morph when they change.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `string` | – | Headline. A new title rises in over the old one. |
| `tone` | `"info" \| "success" \| "warning" \| "danger"` | `"info"` | Colour and icon. Danger uses role="alert"; the rest use role="status". |
| `children` | `ReactNode` | – | Details under the title. String children crossfade when they change. |
| `open` | `boolean` | – | Controls presence. Hiding collapses the height and fades it out. |
| `onDismiss` | `() => void` | – | Shows a dismiss button. Uncontrolled alerts collapse first, then call this. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | – | Forwarded to the alert element, such as className and id. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / Space | Activates the dismiss button when present. |

## Accessibility


- Danger alerts use role="alert" and interrupt; other tones use role="status" and announce politely.
- Outgoing copies are aria-hidden while they fade, so the live region reads only the current text.
- The dismiss button is labelled "Dismiss: <title>"; the tone icon is aria-hidden.

## Motion


- Presence collapses or expands the height on a smooth spring with a fade, so content below closes the gap.
- Tone changes morph the icon through a small scale and blur; copy changes rise in while the height springs to fit.
- Reduced motion swaps content with short fades and no height animation.

## Responsive behavior


- The alert fills its container and the copy wraps; the icon and dismiss button keep fixed sizes.
- Hover styles on the dismiss button apply only on hover-capable fine pointers.

## Performance


- A ResizeObserver lets the height spring when copy changes; keep only a few alerts mounted per page.

## Notes


- Use for persistent, in-flow messages tied to a page or form. Use toast for transient results of an action.
- Keep one Alert mounted and change tone, title, and children to morph between states instead of swapping components.

## Related

- [Toast](/components/toast): Brief confirmation for a completed background action.
