---
title: Avatar
slug: avatar
description: "A compact identity marker for people and accounts."
category: data-display
component: Avatar
keywords:
  - identity
  - people
  - react avatar
  - avatar component
  - user avatar with initials
  - profile picture
  - avatar with status
  - online indicator avatar
---

A compact identity marker for people and accounts.

<!-- demo: Hero -->

## When to use


- Showing one person next to their name, comment, or record.
- Presence in a header or list, via the online or offline status dot.
- Places where a photo may be missing and initials should stand in.

## When not to use


- Use avatar-group for several people with an overflow count.
- Use user-menu when the avatar is the trigger for account actions.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Avatar } from "@sagui/ui";

export function Owner() {
  return <Avatar name="Maya Chen" src="/people/maya.jpg" size="lg" status="online" />;
}
```

## Examples

### Sizes

<!-- demo: Sizes -->

### Photo and fallback

A photo that fails to load falls back to initials.

<!-- demo: Photo -->

### Status

<!-- demo: Status -->


## API reference


### Avatar

A round portrait that falls back to initials and can show an online or offline dot.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` (required) | `string` | – | Full name. Used for the accessible label and the first two initials. |
| `src` | `string` | – | Image URL, rendered as a plain img. Falls back to initials if it fails to load. |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Diameter, from 28px to 88px. |
| `status` | `"online" \| "offline"` | – | Adds a presence dot and appends the status to the label. |
| `...props` | `HTMLAttributes<HTMLSpanElement>` | – | Forwarded to the root span, including className. |

## Accessibility


- The root is role="img" with an aria-label of the name plus status, such as "Maya Chen, online".
- The image and initials are decorative, so the name is read once.
- The status dot is hidden from assistive tech; the label carries the state.

## Motion


- A photo still loading fades in from a soft blur; a cached one shows at once.
- The status dot pops in and out on a snappy spring.
- Reduced motion swaps the dot instantly and drops the image fade.

## Responsive behavior


- Size is fixed by the size prop, from 28px to 88px, and never changes by breakpoint.
- The photo is a plain img sized to the circle; pass a URL already sized for the largest circle you show.

## Performance


- Serve photos at roughly twice the circle size so they stay sharp on high density screens without wasting bytes.
- A cached photo shows at once; only a still-loading photo runs the short blur fade.

## Notes


- Use for a single person. For a row of people with an overflow count use avatar-group.
- Photos are a plain img element, so any URL works; no image loader configuration is needed.

## Related

- [Avatar group](/components/avatar-group): Show a team or set of contributors in a small space.
- [Card](/components/card): A contained group of related content and actions.
