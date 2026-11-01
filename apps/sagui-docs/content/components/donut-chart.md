---
title: Donut chart
slug: donut-chart
description: "A donut whose arcs morph between datasets, with the active value rolling into the center."
category: charts
component: DonutChart
keywords:
  - data
  - new
  - react donut chart
  - pie chart
  - ring chart
  - share of total chart
  - animated donut
  - chart with legend
  - category breakdown
  - accessible pie chart
---

A donut whose arcs morph between datasets, with the active value rolling into the center.

<!-- demo: Hero -->

## When to use


- Traffic by source, spend by category, or storage by file type.
- A dashboard card where the total and one highlighted share matter most.
- Switching between datasets, such as this month and last month, with the same categories.

## When not to use


- Use bar-chart when precise comparison between parts matters or there are many parts.
- Use gauge or usage-meter for a single value against a limit.
- Use line-chart for change over time.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { DonutChart } from "@sagui/ui";

export function TrafficSources() {
  return (
    <DonutChart
      label="Visits by source"
      unit="visits"
      data={[
        { key: "search", label: "Search", value: 4210 },
        { key: "direct", label: "Direct", value: 2380 },
        { key: "social", label: "Social", value: 1190 },
        { key: "email", label: "Email", value: 640 },
        { key: "ads", label: "Ads", value: 120 },
        { key: "other", label: "Referral", value: 90 },
      ]}
    />
  );
}
```

## Examples

### Morphing between datasets

Arcs keep their key, so switching datasets sweeps each one to its new size.

<!-- demo: Morph -->

### Selecting a segment

`legendAction="select"` pins a segment from the legend instead of hiding it.

<!-- demo: Select -->


## API reference


### DonutChart

A donut chart with a synced legend that shows and hides segments, a rolling center readout, automatic Other grouping, and arcs that morph between datasets.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `DonutChartDatum[]` | – | Parts: { key, label, value, color? }. Values of zero or less are left out. |
| `label` (required) | `string` | – | What the whole is, such as "Visits by source". Names the chart for assistive technology. |
| `unit` | `string` | `""` | Unit after values, such as "visits". Shown under the total at rest. |
| `formatValue` | `(value: number) => string` | `grouped number` | Formats values in the center, legend, and table. |
| `totalLabel` | `string` | `"Total"` | Center label at rest, above the total. |
| `size` | `number` | `208` | Diameter in pixels. The chart scales down to fit narrower containers. |
| `thickness` | `number` | `24` | Ring thickness in pixels. |
| `groupBelow` | `number` | `0.04` | Parts below this share of the total join Other, when at least two would. |
| `maxSegments` | `number` | `6` | The most segments drawn, counting Other. The smallest parts beyond it are grouped. |
| `otherLabel` | `string` | `"Other"` | Label of the grouped segment. |
| `activeKey` | `string \| null` | – | Controlled selected segment key. Hover and focus preview other segments without changing it. |
| `defaultActiveKey` | `string \| null` | `null` | Selected segment on first render when uncontrolled. |
| `onActiveChange` | `(key: string \| null) => void` | – | Called when a segment is pinned or unpinned by clicking the ring, or a legend row when legendAction is select. |
| `hiddenKeys` | `string[]` | – | Controlled hidden segment keys. A hidden segment closes and the rest of the ring redistributes. |
| `defaultHiddenKeys` | `string[]` | `[]` | Hidden segments on first render when uncontrolled. |
| `onHiddenKeysChange` | `(keys: string[]) => void` | – | Called when a legend row shows or hides its segment. |
| `legendAction` | `"toggle" \| "select"` | `"toggle"` | What clicking a legend row does: show or hide its segment, or pin it as the selected segment. |
| `legend` | `boolean` | `true` | The synced legend beside or below the ring. |
| `emptyLabel` | `string` | `"No data yet"` | Center text when the total is zero. |
| `ref` | `Ref<HTMLElement>` | – | The figure element. |
| `className` | `string` | – | Class on the figure. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| ArrowDown / ArrowRight | Moves to the next legend row, looping at the end. |
| ArrowUp / ArrowLeft | Moves to the previous legend row. |
| Home / End | Jumps to the first or last row. |
| Enter / Space | Shows or hides the focused segment; with legendAction select, pins or unpins it. |
| Escape | Clears the pinned segment. |
| Arrow keys on the ring | Without a legend the ring takes focus: arrows walk the segments, Enter pins one, and each is announced. |

## Accessibility


- The legend is the keyboard path: each row is a button with aria-pressed (shown, or pinned with legendAction select) and a label giving value, share, and grouped members.
- Showing or hiding a segment is announced in a polite live region with the new total. Without a legend the ring is focusable and announces each segment as the arrows reach it.
- The ring and center readout are aria-hidden; a hidden summary and table list every part, including the members of Other.
- Keyboard focus previews a segment in the ring; hover previews with a mouse only. No focus rings are drawn.

## Motion


- One sweep the first time the chart scrolls into view: every segment leaves the top together and each trailing edge follows a beat behind the one before.
- New data and hidden segments morph start and end angles, never paths, from wherever each arc is on screen. Springs keep their velocity, so an interrupted change continues smoothly. Segments keep their order and never remount mid-morph.
- The active segment slides out along its middle and thickens slightly while the others dim. One pointer handler hit-tests the angle, so crossing a gap never drops the hover.
- The center readout rolls like a drum toward the active segment with tabular numbers in a fixed cell; totals and shares count to new values.
- Reduced motion jumps arcs, lifts, and text to their final state.

## Responsive behavior


- The figure is a container: at 460px and wider the legend sits beside the ring, below that it stacks under it.
- The ring scales down from size to fit narrower containers while keeping its aspect ratio.
- Legend hover styles only apply on hover-capable fine pointers; taps pin a segment.

## Performance


- Arc angles and lifts are motion values; one batched paint per frame writes every path d and transform straight to the DOM, with no React render per frame.
- Counting numbers write their text directly; center readouts stay mounted, so hovering never mounts or unmounts nodes.

## Notes


- Use for two to six parts of one whole. With more parts, lean on groupBelow and maxSegments or use bar-chart.
- Keep keys stable between datasets so arcs morph in place.
- Leave color out to get the chart palette (`--color-chart-1` to `--color-chart-4`) in data order, then neutral steps; a key keeps its color across datasets. Pass colors only when they carry meaning.
- Legend rows show and hide segments by default; set legendAction to select for the older pin behavior.
- Drive activeKey from a table or filter to highlight the same category elsewhere.

## Related

- [Bar chart](/components/bar-chart): Compare one measure across days and scrub any bar for its value.
- [Line chart](/components/line-chart): A multi-series line chart with a gliding crosshair, legend toggles, and paths that morph between ranges.
- [Gauge](/components/gauge): Show a value against a known range.
