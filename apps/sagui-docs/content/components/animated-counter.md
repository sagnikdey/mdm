---
title: Animated counter
slug: animated-counter
description: "Give changing totals a clear sense of movement."
category: cards
component: AnimatedCounter
keywords:
  - data
  - motion
  - react animated counter
  - number ticker
  - odometer counter
  - rolling digits
  - count up animation
  - animated number
---

Give changing totals a clear sense of movement.

<!-- demo: Hero -->

## When to use


- Standalone numbers that change, such as totals, prices, or live counts.
- Hero stats that roll up from zero when they scroll into view, via animateOnView.

## When not to use


- Use metric-card when the number needs a card around it.
- Use text-morph for words rather than numbers.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { AnimatedCounter } from "@sagui/ui";

export function Raised({ amount }: { amount: number }) {
  return <AnimatedCounter label="Raised" value={amount} prefix="$" animateOnView />;
}
```

## Examples

### Money

<!-- demo: Money -->

### Percentages

<!-- demo: Percent -->


## API reference


### AnimatedCounter

An odometer style number whose digit columns roll to each new value.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` (required) | `number` | – | The number to show. |
| `label` | `string` | – | Small label above the number. |
| `prefix` | `string` | `""` | Text before the number, such as "$". |
| `suffix` | `string` | `""` | Text after the number, such as "%". |
| `decimals` | `number` | `0` | Fixed fraction digits. |
| `animateOnView` | `boolean` | `false` | Rolls every digit up from zero the first time it scrolls into view. |
| `locale` | `string` | `"en-US"` | Formatting locale. Fixed by default so server and client match. |
| `className` | `string` | – | Added to the root. |

## Accessibility


- A visually hidden copy holds the full formatted text; the rolling digits are aria-hidden.
- It does not announce changes; wrap it in a live region if updates must be spoken.

## Motion


- Each digit column turns in the direction the whole number moved, wrapping 9 to 0, with a slight stagger on first reveal.
- Columns and separators slide in or out when the digit count changes.
- Reduced motion jumps digits into place.

## Responsive behavior


- It sizes to its digits, and columns slide in or out when the digit count changes, so neighbours shift slightly.

## Performance


- Each digit is its own motion column; fine for a few counters, not for every cell of a table.
- The first reveal waits for 60% visibility through useInView.

## Notes


- Use for standalone numbers that change: totals, prices, counts. Use metric-card when the number needs a card around it.
- Pass a raw number and let decimals, prefix, and suffix format it; do not pass preformatted strings.

## Related

- [Metric card](/components/metric-card): A compact summary for a number that needs context.
