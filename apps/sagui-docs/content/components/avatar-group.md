---
title: Avatar group
slug: avatar-group
description: "Show a team or set of contributors in a small space."
category: data-display
component: AvatarGroup
keywords:
  - identity
  - people
  - react avatar group
  - avatar stack
  - overlapping avatars
  - team members avatars
  - avatar overflow count
  - collaborators list
---

Show a team or set of contributors in a small space.

<!-- demo: Hero -->

## When to use


- Showing who owns or edits something in a header, card, or table cell.
- Collaborator stacks where people join and leave while the page is open.
- Long member lists that should collapse into a +N chip.

## When not to use


- Use avatar for a single person.
- Use a list or sortable-data-table when people need to see every name and role.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { AvatarGroup } from "@sagui/ui";

const team = [
  { name: "Maya Chen", src: "/people/maya.jpg", status: "online" as const },
  { name: "Leo Park" },
  { name: "Sara Ruiz" },
  { name: "Tom Hale" },
  { name: "Ines Ma" },
];

export function Collaborators() {
  return <AvatarGroup members={team} max={3} label="Editors" />;
}
```

## Examples

### Sizes

<!-- demo: Sizes -->

### People joining and leaving

Keep the group mounted and change `members`. Slots open and close, and the overflow count rolls.

<!-- demo: Joining -->


## API reference


### AvatarGroup

An overlapping stack of avatars with a +N overflow chip.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `members` (required) | `{ name: string; src?: string; status?: "online" \| "offline" }[]` | – | People in display order. Names double as keys, so keep them unique. |
| `max` | `number` | `4` | Avatars shown before the rest collapse into the overflow count. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size passed to each avatar and the overflow chip. |
| `label` | `string` | `"Team members"` | Accessible name for the group, also used in the overflow label. |
| `className` | `string` | – | Class for the group wrapper. |

## Accessibility


- Renders role="group" with the label as its name.
- The overflow chip is role="img" labelled like "2 more editors".
- Each avatar keeps its own name and status label.

## Motion


- Joining or leaving members open and close their slot on a spring, so the stack slides instead of jumping.
- The overflow count rolls up when it grows and down when it shrinks.
- Hover fans the stack apart in CSS. Reduced motion removes the fan and swaps counts with a plain fade.

## Responsive behavior


- The stack is inline-flex and does not wrap; lower max on narrow rows so it stays compact.
- The hover fan applies only on hover-capable fine pointers, so touch taps do not spread the stack.

## Performance


- Only max avatars render; the rest collapse into one overflow chip, so long member lists stay cheap.
- Joins and leaves animate slot width on a spring; the fan is plain CSS transforms.

## Notes


- Use for presence and ownership in headers, cards, and table cells. Use avatar for one person.
- Pass the full member list and let max handle truncation; do not slice it yourself or the overflow count is lost.

## Related

- [Avatar](/components/avatar): A compact identity marker for people and accounts.
- [Card](/components/card): A contained group of related content and actions.
