---
title: Bar chart
slug: bar-chart
description: "Compare one measure across days and scrub any bar for its value."
category: charts
component: BarChart
keywords:
  - chart
  - bar
  - data
  - react bar chart
  - column chart
  - animated bar chart
  - svg bar chart
  - scrubbable chart
  - daily activity chart
---

Compare one measure across days and scrub any bar for its value.

<!-- demo: Hero -->

## When to use


- One measure across days, weeks, or months, with an average line.
- Charts with a range switch, where stable keys let bars morph between ranges.

## When not to use


- Use sparkline for a compact trend.
- Use activity-heatmap for daily rhythm over a year.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { BarChart } from "@sagui/ui";

const week = [
  { key: "2026-09-14", label: "Mon, Sep 14", axisLabel: "M", value: 32 },
  { key: "2026-09-15", label: "Tue, Sep 15", axisLabel: "T", value: 48 },
  { key: "2026-09-16", label: "Wed, Sep 16", axisLabel: "W", value: 27 },
];

export function ActiveMinutes() {
  return <BarChart data={week} label="Active minutes" period="Sep 14–16, 2026" unit="min" />;
}
```

## Examples

### Switching ranges

Bars with the same key keep their place, so a range switch morphs instead of redrawing.

<!-- demo: Ranges -->

### Without the average line

<!-- demo: NoAverage -->


## API reference


### BarChart

A single series column chart with an average line and a scrubbable headline value.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `{ key: string; label: string; axisLabel?: string; value: number }[]` | – | Bars in order. A surviving key keeps its bar, so range switches morph. |
| `label` (required) | `string` | – | What is measured, such as "Active minutes". |
| `period` (required) | `string` | – | Range on show, under the headline. |
| `unit` | `string` | `""` | Unit after each value, such as "min". |
| `averageLabel` | `string` | `"Daily average"` | Headline label at rest. |
| `valueLabel` | `string` | `"Total"` | Headline label while a bar is scrubbed. |
| `categoryLabel` | `string` | `"Day"` | First column header in the screen reader table. |
| `showAverage` | `boolean` | `true` | Draws the average as a reference line. |
| `height` | `number` | `176` | Plot height in pixels. |
| `formatValue` | `(value: number) => string` | – | Formats values and ticks. Defaults to a grouped number. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| ArrowLeft / ArrowRight | Moves between bars (ArrowDown and ArrowUp too). |
| PageDown / PageUp | Moves up to seven bars. |
| Home / End | Jumps to the first or last bar. |
| Escape | Stops scrubbing and returns to the average. |

## Accessibility


- The SVG is role="img" with a summary of average, highest, and lowest.
- A focusable role="slider" scrubber reads each bar as its label and value.
- A visually hidden table lists every value, and range changes are announced politely.

## Motion


- Bars grow in with a stagger on first view; new ranges morph bars, ticks, and the average line.
- Scrubbing moves a cursor and rolls the headline value.
- Reduced motion shows bars at once and swaps values without movement.

## Responsive behavior


- The plot measures its width with a ResizeObserver and bars cap at 28px, so wide containers get spacing rather than fat bars.
- Scrubbing uses touch-action pan-y, so a horizontal drag scrubs while vertical swipes scroll the page.

## Performance


- Bars, ticks, and the average line animate with motion values; one series and many bars per view is the intended load.
- A visually hidden table renders every value, so very long ranges double the DOM.

## Notes


- Use for one measure across days, weeks, or months. Use sparkline for a compact trend and activity-heatmap for daily rhythm over a year.
- Use stable keys such as ISO dates so switching ranges morphs instead of redrawing.

## Related

- [Sparkline](/components/sparkline): Show a compact trend beside a value.
- [Activity heatmap](/components/activity-heatmap): See a year of activity at a glance, one square per day.
- [Segmented control](/components/segmented-control): Switch between a small set of related views.
