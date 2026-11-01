---
title: Notification center
slug: notification-center
description: "A home for updates with read state, grouped information, and animated disclosure."
category: messages
component: NotificationCenter
keywords:
  - react notification center
  - notification bell
  - notification dropdown
  - inbox popover
  - unread notifications
  - activity feed popover
---

A home for updates with read state, grouped information, and animated disclosure.

<!-- demo: Hero -->

## When to use


- A bell in the app header with an unread badge and an inbox of recent updates.
- Notifications people can mark read, expand, and dismiss in bulk.

## When not to use


- Use toast-stack for transient messages that should disappear.
- Use inbox-triage for a full-page inbox.
- Use badge for a count without a panel.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { NotificationCenter } from "@sagui/ui";

export function HeaderBell() {
  return (
    <NotificationCenter
      notifications={[
        { id: "1", title: "Deploy finished", time: "2m", tone: "success" },
        { id: "2", title: "Ana commented", time: "1h", actor: { name: "Ana", photo: "/ana.jpg" } },
      ]}
      onReadChange={(item, read) => markRead(item.id, read)}
      onDismiss={item => dismiss(item.id)}
    />
  );
}
```

## Examples

### Everything read

<!-- demo: AllRead -->


## API reference


### NotificationCenter

A bell trigger with an unread badge that opens a popover of notifications with All and Unread views, expandable rows, and bulk actions.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `notifications` (required) | `NotificationItem[]` | – | Initial notifications. The component keeps its own copy after mount. |
| `label` | `string` | `"Notifications"` | Panel heading and trigger label. |
| `onReadChange` | `(notification: NotificationItem, read: boolean) => void` | – | Called for each item marked read or unread, including Mark all read. |
| `onDismiss` | `(notification: NotificationItem) => void` | – | Called for each dismissed item, including Clear read. |
| `open` | `boolean` | – | Controlled open state. |
| `onOpenChange` | `(open: boolean) => void` | – | Called when the popover opens or closes. |
| `avoidCollisions` | `boolean` | `true` | Lets the popover flip or shift to stay in the viewport. |

### NotificationItem

Item type: { id: string; title: string; description?: string; time: string; read?: boolean; tone?: "info" | "success" | "warning"; actor?: { name: string; photo: string } }. actor shows an avatar instead of a tone icon.

No props.

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / Space | Opens the panel from the trigger, toggles a row's details, and activates actions. |
| Escape | Closes the panel and returns focus to the trigger (Radix Popover). |
| Tab | Moves through view toggles, rows, and row actions. |

## Accessibility


- The trigger's aria-label includes the unread count; the visual badge is aria-hidden.
- The summary line is aria-live polite, and outgoing text copies are aria-hidden while they fade.
- Row toggles use aria-expanded and announce unread state; view toggles use aria-pressed.
- Focus moves to the next row, or a view toggle, after an item is read, dismissed, or cleared.

## Motion


- The bell tilts when open; counts roll like an odometer in the direction of change.
- Rows open and collapse their own height on a spring, and bulk actions cascade down the list in under a quarter second.
- Reduced motion replaces height, roll, and tilt with instant fades.

## Responsive behavior


- The panel is min(424px, 100vw minus 24px) wide and at most min(590px, 100vh minus 24px) tall, with the list scrolling inside.
- Below 380px padding tightens, the details indent shrinks, and the Mark all read label becomes icon only.
- Titles and previews ellipsize on one line.

## Performance


- The list is not virtualized and keeps its own copy of the notifications; cap what you pass in.
- The panel mounts in a portal only while open.

## Notes


- Use in an app header for an inbox of updates. Use toast or toast-stack for transient messages and inbox-triage for a full-page inbox.
- notifications seeds internal state; sync changes back to your server through onReadChange and onDismiss rather than re-passing the array.

## Related

- [Popover](/components/popover): A small anchored surface for contextual information.
- [Badge](/components/badge): A small label for status, category, or metadata.
- [Avatar](/components/avatar): A compact identity marker for people and accounts.
