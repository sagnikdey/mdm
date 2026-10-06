---
title: Metric card
slug: metric-card
description: "A compact summary for a number that needs context."
category: cards
component: MetricCard
keywords:
  - data
  - summary
  - react metric card
  - kpi card
  - odometer number
  - rolling number card
  - dashboard metric
  - stat tile
---

A compact summary for a number that needs context.

<!-- demo: Hero -->

## When to use


- A single plain number with odometer style rolling digits, such as uptime or orders.
- Numbers that update live and should roll in the direction they moved.

## When not to use


- Use sparkline when the trend over time matters more than the latest value.
- Use animated-counter for a number without a card around it.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { MetricCard } from "@sagui/ui";

export function Uptime() {
  return <MetricCard label="Uptime" value={99.9} suffix="%" context="Last 30 days" change="+0.2%" />;
}
```

## Examples

### A falling number

A leading minus reads red, and the digits roll down.

<!-- demo: Down -->

### Prefix and no change chip

<!-- demo: Money -->

### Changing values

The number turns the way it moved, and the label, chip and context reword in place.

<!-- demo: Live -->


## API reference


### MetricCard

A compact card with a label, an odometer style number, context line, and optional change chip.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | What is measured. |
| `value` (required) | `number` | – | The number. Rolls up from zero on first view, then between values. |
| `suffix` | `string` | – | Text after the number, such as "%" or " ms". |
| `prefix` | `string` | – | Text before the number, such as "$". |
| `decimals` | `number` | `0` | Fixed fraction digits. |
| `context` (required) | `string` | – | Line under the number, such as "vs last week". |
| `change` | `string` | – | Chip in the top corner, such as "+12%". A leading plus reads green and a leading minus red. Omit to hide it. |
| `className` | `string` | – | Added to the root article. |

## Accessibility


- Renders an article; the number is read as plain text through a visually hidden copy.
- The change chip is plain text, so write the direction into it (+ or -) rather than relying on color.
- It does not announce updates; wrap it in a live region if values change while people watch.

## Motion


- The value uses animated-counter: digits roll on view and turn the way the number moved.
- Label, context, and change copy roll in from the direction the number moved, and the chip width springs.
- Reduced motion jumps the digits and swaps copy with a quick fade.

## Responsive behavior


- Below 380px the padding tightens and the change chip wraps under the label instead of crowding it.
- Copy lines stay on one line and clip, so keep label and context short.

## Performance


- Digits roll with animated-counter and a ResizeObserver drives the chip width spring; a dashboard row of cards is fine.

## Notes


- Use when the value is a plain number and you want the rolling digits.
- value must be a number; put units in suffix and formatting-free context in context.

## Related

- [Animated counter](/components/animated-counter): Give changing totals a clear sense of movement.
