---
title: Slope chart
slug: slope-chart
description: "Before and after on two axes: lines draw in, rank moves sit beside each value, and switching datasets slides every line to its new slope."
category: charts
component: SlopeChart
keywords:
  - data
  - chart
  - new
  - slope chart
  - slopegraph
  - before after chart
  - react slope chart
  - rank change chart
  - two period comparison
  - bump chart
  - animated slope chart
---

Before and after on two axes: lines draw in, rank moves sit beside each value, and switching datasets slides every line to its new slope.

<!-- demo: Hero -->

## When to use


- Showing which items rose, which fell, and how the order changed between two periods.
- Replacing a grouped bar chart when the change is the story.

## When not to use


- Use line-chart for three or more moments.
- Use bar-chart when only the latest values matter.
- Avoid more than about ten items; labels start to crowd.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { SlopeChart } from "@sagui/ui";

const channels = [
  { key: "email", label: "Email", start: 3.1, end: 4.6 },
  { key: "search", label: "Organic search", start: 3.4, end: 3.6 },
  { key: "social", label: "Paid social", start: 1.9, end: 1.3 },
];

export function Channels() {
  return <SlopeChart data={channels} label="Conversion by channel" startLabel="Q1" endLabel="Q2" highlightKey="email" formatValue={value => `${value.toFixed(1)}%`} />;
}
```

## Examples

### Switching datasets

Lines keep their key, so a new dataset slides every line to its new slope.

<!-- demo: Quarters -->


## API reference


### SlopeChart

Before and after for several items on two shared axes. Lines draw in on first view, labels spread apart to avoid overlaps with a hairline back to their point, rank moves sit beside each end value, and switching datasets slides every line to its new slope.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `SlopeItem[]` | – | Items: { key, label, start, end }. Keys keep lines stable across datasets. |
| `label` (required) | `string` | – | What is measured. Names the chart, the summary, and the table. |
| `startLabel` (required) | `string` | – | First column heading, such as "Q1". |
| `endLabel` (required) | `string` | – | Second column heading, such as "Q2". |
| `formatValue` | `(value: number) => string` | – | Formats values beside the points, in the tooltip, and in the table. |
| `formatChange` | `(change: number, item: SlopeItem) => string` | – | Formats the change in the tooltip, such as "+1.5 pts". |
| `height` | `number` | `44px per item` | Plot height in pixels. |
| `highlightKey` | `string \| null` | `null` | The item drawn in the first chart color (`--color-chart-1`). |
| `activeKey` | `string \| null` | – | Controlled item in focus. The others fade. |
| `onActiveChange` | `(key: string \| null) => void` | – | Called as the item in focus changes. |
| `ranks` | `boolean` | `true` | Rank movement beside each end value. |
| `emptyLabel` | `string` | `"No data"` | Message when there are no items. |
| `ref` | `Ref<HTMLElement>` | – | Forwarded to the figure. |
| `className` | `string` | – | Extra class on the figure. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Tab | Focuses the chart and reads the top item by end value. |
| ArrowDown / ArrowRight | Next item in end order. |
| ArrowUp / ArrowLeft | Previous item. |
| Home / End | First or last item. |
| Escape | Clears the reading. |

## Accessibility


- The chart is a focusable group with a roledescription and instructions; lines and labels are aria-hidden.
- A polite live region reads both values, the change, and the rank move for the item in focus.
- A visually hidden summary and a table list every item in end order.
- Rank moves use an arrow glyph and a number, never colour alone.

## Motion


- On first view each line draws from start to end with a small stagger, and the end dots and labels arrive as it lands.
- Switching datasets moves lines, dots, labels, and leader hairlines on the shared morph spring; rank numbers roll in the direction they moved.
- The item in focus comes forward while the others fade; the tooltip glides to the middle of its line.
- Reduced motion shows every line drawn and moves it immediately.

## Responsive behavior


- Label columns narrow below 440px and names truncate with an ellipsis; the full name stays in the tooltip and table.
- Overlapping labels spread apart with a hairline to their point instead of colliding.
- Touch reads the nearest line with a press and drag.

## Performance


- SVG lines and HTML labels animated with springs; around ten items render in a few dozen nodes.
- One ResizeObserver measures the container.

## Notes


- Choose it for exactly two moments and three to ten items: before and after a launch, quarter over quarter, last year against this year.
- Use highlightKey for the item the story is about.
- Give the columns short headings; names sit on the left only, values on both sides.
- For more than two moments use line-chart.

## Related

- [Line chart](/components/line-chart): A multi-series line chart with a gliding crosshair, legend toggles, and paths that morph between ranges.
- [Bar chart](/components/bar-chart): Compare one measure across days and scrub any bar for its value.
- [Streamgraph](/components/streamgraph): Layered streams on a wiggle baseline that morph between ranges, with a layer you can isolate and read week by week.
- [Sortable data table](/components/sortable-data-table): Compare structured records with sortable columns.
