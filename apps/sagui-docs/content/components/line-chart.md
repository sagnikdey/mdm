---
title: Line chart
slug: line-chart
description: "A multi-series line chart with a gliding crosshair, legend toggles, and paths that morph between ranges."
category: charts
component: LineChart
keywords:
  - data
  - new
  - react line chart
  - time series chart
  - animated line chart
  - chart with crosshair
  - trend chart
  - multi series line chart
  - dashboard chart
  - accessible chart
---

A multi-series line chart with a gliding crosshair, legend toggles, and paths that morph between ranges.

<!-- demo: Hero -->

## When to use


- Traffic, revenue, or latency over days or weeks in a dashboard card.
- Comparing this period against a previous period or target with a dashed series.
- Charts that switch ranges (7d, 30d, 90d) and should morph rather than redraw.

## When not to use


- Use sparkline for a tiny inline trend with no axes or tooltip.
- Use bar-chart for discrete categories or counts per bucket.
- Use donut-chart when the question is the share of a whole, not change over time.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { LineChart } from "@sagui/ui";

const data = [
  { key: "2026-09-01", label: "Tue, Sep 1", axisLabel: "Sep 1", values: { signups: 120, previous: 98 } },
  { key: "2026-09-02", label: "Wed, Sep 2", values: { signups: 142, previous: 104 } },
  { key: "2026-09-03", label: "Thu, Sep 3", axisLabel: "Sep 3", values: { signups: 131, previous: 110 } },
];

export function SignupsChart() {
  return (
    <LineChart
      label="Signups"
      data={data}
      series={[
        { key: "signups", label: "This period" },
        { key: "previous", label: "Previous period", dashed: true },
      ]}
    />
  );
}
```

## Examples

### Switching ranges

Keep the chart mounted and pass new data. Points that survive keep their place and the lines morph to the new range.

<!-- demo: Ranges -->

### A headline driven by the crosshair

`onActiveChange` reports the point under the crosshair, so a headline can follow it and fall back to the latest point.

<!-- demo: Readout -->

### Straight segments

`curve="linear"` draws straight segments, which suit measurements more than trends.

<!-- demo: Linear -->


## API reference


### LineChart

An SVG line chart with a scrubbable crosshair, series toggles, morphing data changes, and a screen reader data table.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `LineChartDatum[]` | – | Points: { key, label, axisLabel?, values }. values maps series keys to numbers; a missing value counts as zero. |
| `series` (required) | `LineChartSeries[]` | – | Lines: { key, label, color?, dashed?, area? }. area defaults to true for the first series. |
| `label` (required) | `string` | – | What is measured, such as "Signups". Names the chart for assistive technology. |
| `unit` | `string` | `""` | Unit after each value in the tooltip and table, such as "ms". |
| `height` | `number` | `220` | Plot height in pixels. The width follows the container. |
| `formatValue` | `(value: number, series: LineChartSeries) => string` | – | Formats values in the tooltip and data table. Defaults to grouped numbers with one decimal. |
| `formatTick` | `(value: number) => string` | `compact format` | Formats the value axis, such as 1.2K. |
| `hiddenSeries` | `string[]` | – | Controlled hidden series keys. |
| `defaultHiddenSeries` | `string[]` | – | Hidden series keys on first render when uncontrolled. |
| `onHiddenSeriesChange` | `(hidden: string[]) => void` | – | Called when a legend toggle changes the hidden keys. |
| `onActiveChange` | `(index: number \| null, datum: LineChartDatum \| null) => void` | – | Called as the crosshair moves, and with null when it leaves. Use it to drive a headline readout. |
| `loading` | `boolean` | `false` | Dims the current lines while the next range loads, or shows a skeleton when there is no data. |
| `emptyLabel` | `string` | `"No data for this range"` | Shown when there are no points. |
| `legend` | `boolean` | – | Series toggles above the plot. Shown by default when there is more than one series. |
| `categoryLabel` | `string` | `"Date"` | Header of the first column in the screen reader table, and part of the plot's slider label. |
| `curve` | `"smooth" \| "linear"` | `"smooth"` | Monotone curves that never swing past the data, or straight segments. |
| `ref` | `Ref<HTMLElement>` | – | The figure element. |
| `className` | `string` | – | Class on the figure. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| ArrowLeft / ArrowDown | Moves the crosshair to the previous point. |
| ArrowRight / ArrowUp | Moves to the next point; from rest it starts on the latest point. |
| PageUp / PageDown | Jumps about a sixth of the range. |
| Home / End | Jumps to the first or last point. |
| Escape | Lets go of the crosshair. |

## Accessibility


- The figure is named by label; the plot is a role="slider" whose aria-valuetext reads the date and every visible series value.
- A visually hidden summary gives the range and latest values, and a hidden table lists every point for screen readers.
- Legend toggles are buttons with aria-pressed; a hidden live region says Loading while loading is true.
- The SVG and tooltip are aria-hidden, so values are never read twice.

## Motion


- Lines draw left to right the first time the chart scrolls into view.
- New data morphs every line from the shape on screen, sampled on shared x positions, and the value scale springs to its new range while gridlines slide.
- A hidden series flattens into the baseline as it fades; the crosshair glides between points and the tooltip follows on its own spring, flipping sides near the edge.
- Reduced motion skips the draw, morphs, and glides, and stops the loading pulse.

## Responsive behavior


- Width follows the container through a ResizeObserver; the plot redraws in its own pixels, and axis labels thin to one per 76px.
- Touch scrubs with pointer capture and releases on lift; touch-action: pan-y keeps vertical page scroll working over the plot.
- A mouse scrubs on hover and releases on leave. The value gutter is a fixed 48px column.

## Performance


- Paths are written straight to the DOM from motion values, not React state, so scrubbing and morphs do not re-render the tree.
- Smooth curves are sampled up to 16 points per segment (about 192 per line); keep data to a few hundred points per series.
- One ResizeObserver per chart; the draw-in waits for useInView.

## Notes


- Use for one to three measures over time when the trend shape matters. For category comparison use bar-chart; for parts of a whole use donut-chart.
- Keep series and datum keys stable across range changes so lines morph instead of redrawing.
- Set axisLabel only on the dates you want on the axis; the chart thins them further to one per 76px, always keeping the newest.
- Drive a headline number from onActiveChange, as in metric-card or stat-card layouts.

## Related

- [Bar chart](/components/bar-chart): Compare one measure across days and scrub any bar for its value.
- [Sparkline](/components/sparkline): Show a compact trend beside a value.
- [Donut chart](/components/donut-chart): A donut whose arcs morph between datasets, with the active value rolling into the center.
- [Metric card](/components/metric-card): A compact summary for a number that needs context.
