---
title: Text morph
slug: text-morph
description: "Morph a label into its next state, letter by letter."
category: text
component: TextMorph
keywords:
  - text
  - motion
  - status
  - react text morph
  - morphing text
  - animated label
  - text transition
  - letter morph animation
  - shared letter animation
---

Morph a label into its next state, letter by letter.

<!-- demo: Hero -->

## When to use


- Status words that change a few letters at a time, such as Follow and Following.
- Custom buttons or badges that need a morphing label without the rest of the button.
- Inline counters or short state labels that should glide instead of jump.

## When not to use


- Use word-rotate for a sentence with one cycling word.
- Use button or action-swap when you want the morph plus button behaviour.
- Avoid it for text that wraps, since it always renders a single line.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { TextMorph } from "@sagui/ui";

export function PublishButton({ state }: { state: "idle" | "busy" | "done" }) {
  const label = state === "idle" ? "Publish" : state === "busy" ? "Publishing" : "Published";
  return (
    <button type="button">
      <TextMorph>{label}</TextMorph>
    </button>
  );
}
```

## Examples

### A heading

<!-- demo: Heading -->


## API reference


### TextMorph

Morphs one short label into the next in place. Shared letters glide, new ones sharpen in, removed ones blur away, and the width springs to fit.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` (required) | `string` | – | The current label. Change it to morph. |
| `as` | `"span" \| "div" \| "p" \| "strong" \| "h1" \| "h2" \| "h3"` | `"span"` | Rendered element. |
| `className` | `string` | – | Applied to the rendered element. |
| `id` | `string` | – | Forwarded to the rendered element. |

## Accessibility


- The plain label is in a visually hidden span; the animated glyphs are aria-hidden.
- It does not announce changes. Wrap it in your own aria-live region if a status change must be announced.

## Motion


- Letters are matched by character and occurrence, so shared letters glide to their new positions on a spring while new letters stagger in with a blur.
- The frame width springs to the new label; font loading or resizes follow immediately without animating.
- Reduced motion swaps the label and width instantly.

## Responsive behavior


- The frame width springs to each label, and a ResizeObserver follows font loading and container resizes without animating.
- The label never wraps, so keep it short in narrow layouts.

## Performance


- Every character is a motion span with layout animation; keep labels to a few words.

## Notes


- Use for status words that change a few letters at a time (Follow / Following, Save / Saved). For a sentence with a cycling word use word-rotate.
- Keep labels to one short line; it never wraps.

## Related

- [Button](/components/button): A clear, responsive action with quiet secondary states.
- [Text shimmer](/components/text-shimmer): Show ongoing work with a calm light across the words.
