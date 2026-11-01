---
title: Text shimmer
slug: text-shimmer
description: "Show ongoing work with a calm light across the words."
category: text
component: TextShimmer
keywords:
  - text
  - motion
  - loading
  - react text shimmer
  - shimmer text
  - ai thinking text
  - loading text animation
  - shiny text
  - gradient text sweep
---

Show ongoing work with a calm light across the words.

<!-- demo: Hero -->

## When to use


- AI thinking or loading labels such as Generating summary.
- Short status lines that should show ongoing work and settle when done.

## When not to use


- Use text-stream for the response text itself.
- Use skeleton for content placeholders and progress for measurable progress.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { TextShimmer } from "@sagui/ui";

export function AssistantStatus({ busy }: { busy: boolean }) {
  return (
    <TextShimmer active={busy}>
      {busy ? "Generating summary" : "Summary ready"}
    </TextShimmer>
  );
}
```

## Examples

### Finishing

When `active` turns false the band glides off, and a new label rises in place.

<!-- demo: Finishing -->

### Larger text

`duration` sets the seconds per sweep.

<!-- demo: Large -->


## API reference


### TextShimmer

A calm light sweep across a short status line to show that work is ongoing. When active turns false the band glides off and the text settles to solid.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` (required) | `string` | – | The status text. Keep it to one short line. A new value rises in place. |
| `active` | `boolean` | `true` | Sweep while work is ongoing. |
| `duration` | `number` | `1.8` | Seconds for one sweep across the text. |
| `as` | `"span" \| "p" \| "div" \| "h2" \| "h3" \| "h4"` | `"span"` | Rendered element. |
| `className` | `string` | – | Merged onto the rendered element. |
| `id` | `string` | – | Forwarded to the rendered element. |

## Accessibility


- Sets aria-busy while active; the text itself stays real, readable text.
- Announce completion from your own aria-live region; the component does not.

## Motion


- A bell-shaped highlight band in the current text color sweeps linearly over a muted base, pausing briefly between passes.
- The sweep only runs while active, in view, and the page is visible; a paused band resumes where it stopped. A changed label rises in with a soft blur.
- Reduced motion stops the sweep and swaps labels with a plain fade.

## Responsive behavior


- Keeps max-width 100%, but the band is tuned for one short line, so avoid wrapping text.
- In forced-colors mode the gradient is removed and the text renders in the system color.

## Performance


- The sweep runs only while active, within 64px of the viewport, and while the page is visible.
- It animates a background-clip gradient on one element, with no per-letter spans.

## Notes


- Use for AI thinking or loading labels. Pair with text-stream for the response itself, and use skeleton or progress for content placeholders.
- Flip active to false when work finishes instead of unmounting, so the text settles smoothly.

## Related

- [Text morph](/components/text-morph): Morph a label into its next state, letter by letter.
