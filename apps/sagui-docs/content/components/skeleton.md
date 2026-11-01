---
title: Skeleton
slug: skeleton
description: "Reserve space while content is still loading."
category: cards
component: Skeleton
keywords:
  - loading
  - status
  - react skeleton
  - skeleton loader
  - loading placeholder
  - content placeholder
  - shimmer loading
  - skeleton screen
---

Reserve space while content is still loading.

<!-- demo: Hero -->

## When to use


- Loading states for content whose shape is known, like a profile or comment.
- Swapping a placeholder into real content with a crossfade and height spring.

## When not to use


- Use progress when you can report a percentage.
- Use empty-state when loading finished and there is nothing to show.
- Use text-shimmer for an AI thinking or status line.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Skeleton } from "@sagui/ui";

export function Profile({ user }: { user?: User }) {
  return (
    <Skeleton avatar lines={2} loading={!user}>
      {user && <ProfileCard user={user} />}
    </Skeleton>
  );
}
```

## Examples

### Revealing content

Wrap the real content and set `loading`. The placeholder crossfades into it when loading ends.

<!-- demo: Reveal -->


## API reference


### Skeleton

A pulsing placeholder of text lines and an optional avatar that can crossfade into the loaded content.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | `"Loading content"` | aria-label of the loading status. |
| `lines` | `number` | `3` | Number of text lines, clamped to 1-6. |
| `avatar` | `boolean` | `false` | Adds a round avatar placeholder. |
| `children` | `ReactNode` | – | Content to reveal once loading finishes. With children the placeholder crossfades into them. |
| `loading` | `boolean` | `true` | Keeps the placeholder visible while true. Only used with children. |
| `className` | `string` | – | Class on the outer element. |

## Accessibility


- The placeholder is role="status" with aria-busy and an aria-label; its shapes are aria-hidden.
- With children, the wrapper sets aria-busy while loading.

## Motion


- Blocks pulse in a staggered wave, each a beat after the one above.
- On load the placeholder fades out, content rises 4px into place, and the height springs from placeholder to content.
- Reduced motion stops the pulse and swaps with short fades and no height animation.

## Responsive behavior


- Lines are percentages of the container width, so the placeholder scales with its slot.
- It only draws text lines and an avatar; build custom shapes for grids or media.

## Performance


- The pulse is a CSS animation that stops under reduced motion.
- A ResizeObserver springs the height from placeholder to content; avoid hundreds of skeletons at once.

## Notes


- Use while fetching content whose shape is known. Use progress when you can report a percentage, and empty-state when there is nothing to show.
- Wrap the real content as children and drive loading to get the crossfade; without children it renders only the placeholder.

## Related

- [Empty state](/components/empty-state): A useful next step when there is nothing to show yet.
- [Card](/components/card): A contained group of related content and actions.
