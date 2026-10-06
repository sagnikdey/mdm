---
title: Ridgeline
slug: ridgeline
description: "Overlapping distributions, one ridge per group: hover to lift a ridge and read its quartiles, switch datasets and every curve morphs."
category: charts
component: Ridgeline
keywords:
  - data
  - chart
  - new
  - ridgeline
  - joy plot
  - joyplot
  - density plot
  - distribution
  - kde
  - quartiles
---

Overlapping distributions, one ridge per group: hover to lift a ridge and read its quartiles, switch datasets and every curve morphs.

<!-- demo: Hero -->

## When to use


- Seasonal or categorical distributions such as temperatures by month or response times by region.
- Showing where two groups differ in shape, such as bimodal winters.

## When not to use


- Use beeswarm when each individual observation matters.
- Use bar-chart when only one summary number per group matters.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Ridgeline } from "@sagui/ui";

export function Latency({ regions }: { regions: { id: string; label: string; values: number[] }[] }) {
  return <Ridgeline series={regions} label="API latency by region" unit=" ms" />;
}
```

## Examples

### Without tint

`tint={false}` draws every ridge in one color; `overlap` and `rowHeight` set the spacing.

<!-- demo: Untinted -->


## API reference


### Ridgeline

A ridgeline (joy) plot: one smoothed distribution per row, overlapping like mountain ridges, tinted by median. Hover lifts a ridge above its neighbours to read its quartiles; switching datasets morphs every curve.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `series` (required) | `{ id: string; label: string; values: number[] }[]` | – | One ridge per series, drawn top to bottom. Values are raw observations; the ridge is their kernel density. |
| `label` (required) | `string` | – | What is measured. Names the chart for assistive technology. |
| `unit` | `string` | – | Unit after each value, such as "°" or " ms". |
| `formatValue` | `(value: number) => string` | – | Formats values. Overrides unit. |
| `domain` | `[number, number]` | – | Value range of the axis. Fix it to keep the axis still across datasets. Defaults to the data with room on each side. |
| `overlap` | `number` | `2.4` | How far the tallest ridge rises into the rows above, in row heights. |
| `rowHeight` | `number` | `30` | Height of one row in pixels. |
| `bandwidth` | `number` | – | Smoothing in value units. Defaults to Silverman's rule per series. |
| `tint` | `boolean` | `true` | Shades each ridge by its median, from a light tint to the full first series color, with a stepped scale under the axis. |
| `active` | `string \| null` | – | Controlled id of the lifted ridge. |
| `defaultActive` | `string \| null` | `null` | Initial lifted ridge when uncontrolled. |
| `onActiveChange` | `(id: string \| null) => void` | – | Called when the lifted ridge changes. |
| `emptyLabel` | `string` | `"No data yet"` | Shown when there are no values. |
| `className` | `string` | – | Extra class on the root figure. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| ArrowUp / ArrowDown | Lifts the previous or next ridge. |
| ArrowLeft / ArrowRight | Moves the reading cursor along the values by one axis step. |
| Home / End | Lifts the first or last ridge. |
| Escape | Lowers the ridge and clears the reading. |

## Accessibility


- The plot is a focusable group; the lifted ridge's median, middle half, range, and count are announced through a polite live region.
- A visually hidden table lists median, quartiles, extremes, and count for every series.
- Every row is labelled in text; the median tint is backed by the table and tooltip.

## Motion


- Curves are sampled on a shared grid, so a new dataset or domain interpolates every point: ridges swell, slide, and split in one spring.
- The first reveal rolls the ridges in from the top row down.
- The lifted ridge is a copy drawn above the others that rises 6px on a spring, with its middle half shaded and its median marked.
- The tooltip glides after the pointer and stays inside the chart. Reduced motion draws final shapes immediately.

## Responsive behavior


- Label gutter and tick count adapt to width; the plot redraws at the measured size so strokes stay crisp.
- Touch taps lift a ridge and read at the tapped value.

## Performance


- Densities are computed once per dataset (96 samples per ridge); animation interpolates arrays and writes path strings directly.
- Suitable for up to a few thousand observations per series.

## Notes


- Choose it to compare the shape of many distributions: spread, skew, and bimodality, not just averages.
- Pass raw observations, at least 20 per series, and fix domain when switching datasets so shapes move on a still axis.
- Keep rows to about 20; beyond that, use small multiples or a box plot.
- Colors come from the chart palette, `--color-chart-1` to `--color-chart-4`, which has light and dark values. Override `--sg-chart-1` to `--sg-chart-4` on any ancestor to rebrand a chart. Pair color with labels, since the palette is not tuned for every type of color vision.

## Related

- [Streamgraph](/components/streamgraph): Layered streams on a wiggle baseline that morph between ranges, with a layer you can isolate and read week by week.
- [Line chart](/components/line-chart): A multi-series line chart with a gliding crosshair, legend toggles, and paths that morph between ranges.
- [Activity heatmap](/components/activity-heatmap): See a year of activity at a glance, one square per day.
