---
title: Text reveal
slug: text-reveal
description: "Reveal a short piece of content with restrained motion."
category: text
component: TextReveal
keywords:
  - text
  - motion
  - content
  - react text reveal
  - headline animation
  - hero text animation
  - word by word reveal
  - blur text reveal
  - css text animation
---

Reveal a short piece of content with restrained motion.

<!-- demo: Hero -->

## When to use


- Above-the-fold hero headlines that animate on page load.
- Landing page intros where text must appear on first paint even if scripts are slow.

## When not to use


- Use in-view-title for section titles further down the page.
- Use scroll-highlight for a key paragraph that reveals with scroll.
- Use word-rotate when one word in the headline should cycle.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { TextReveal } from "@sagui/ui";

export function Hero() {
  return <TextReveal as="h1" text={"Ship interfaces\nthat feel precise"} delay={0.1} />;
}
```

## Examples

### Body copy

`as="p"` uses a softer blur. Remount the component to play the reveal again.

<!-- demo: Replay -->


## API reference


### TextReveal

Reveals a headline once on mount: each word rises out of its own clip while it sharpens from a soft blur. Runs in CSS, so it starts on first paint.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` (required) | `string` | – | The copy to reveal. Use \n for a deliberate line break. |
| `as` | `"h1" \| "h2" \| "h3" \| "p"` | `"h2"` | Rendered element. p uses a softer blur. |
| `delay` | `number` | `0` | Seconds before the first word rises. |
| `className` | `string` | – | Merged onto the rendered element. |
| `id` | `string` | – | Forwarded to the rendered element, e.g. for aria-labelledby. |

## Accessibility


- The full text sits in a visually hidden span; the animated words are aria-hidden, so screen readers read one clean sentence.
- Line breaks are read as spaces.
- Pick the heading level with as so the page outline stays correct.

## Motion


- Words rise out of a clip and sharpen from blur on a per-word stagger; total stagger is capped so long text never drags.
- The entrance is pure CSS, so text is never left hidden when scripts load slowly.
- Reduced motion drops the clip and rise and fades the words in quickly.

## Responsive behavior


- The element caps at 24ch with balanced wrapping, so lines stay even on any width.
- Use \n only for breaks that work on every width, since forced breaks apply on mobile too.

## Performance


- Pure CSS keyframes, no JavaScript animation or observers.
- Total stagger is capped, so long text does not lengthen the entrance; each word still gets its own blur filter.

## Notes


- Use for above-the-fold headlines that should animate on page load. For titles further down the page use in-view-title; for body copy worth slowing down on use scroll-highlight.
- It plays once per mount. Change the element's key to replay it.

## Related

- [In-view title](/components/in-view-title): Bring a section title in as it scrolls into view.
- [Text morph](/components/text-morph): Morph a label into its next state, letter by letter.
