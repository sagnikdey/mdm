---
title: Brush chart
slug: brush-chart
description: "A dense time series with an overview strip: drag a window to zoom, resize it by its handles, and read events in place."
category: charts
component: BrushChart
keywords:
  - data
  - chart
  - new
  - brush chart
  - zoomable time series
  - chart with overview
  - range selector chart
  - focus and context chart
  - stock chart brush
  - d3 brush react
  - annotated line chart
---

A dense time series with an overview strip: drag a window to zoom, resize it by its handles, and read events in place.

<!-- demo: Hero -->

## When to use


- Product analytics with a year or more of daily data.
- Incident reviews where events need to be read against a metric.
- Any chart where people ask to zoom into a stretch without losing context.

## When not to use


- Use line-chart for a few weeks of data or several series.
- Use sparkline for a small inline trend without interaction.
- Avoid it for data that dips below zero or needs a log scale.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { useState } from "react";
import { BrushChart } from "@sagui/ui";

export function ActiveUsers({ days }: { days: { date: number; value: number }[] }) {
  const [range, setRange] = useState<[number, number]>([days[days.length - 90].date, days[days.length - 1].date]);
  return <BrushChart data={days} label="Daily active users" unit="users" range={range} onRangeChange={setRange}
    annotations={[{ date: Date.UTC(2026, 2, 24), label: "v2", description: "Offline mode and shared spaces" }]} />;
}
```

## Examples

### Controlled range

Own the window with `range` and `onRangeChange`, for example to show the dates it covers.

<!-- demo: Controlled -->


## API reference


### BrushChart

A detailed time series with an overview strip. Drag the window to pan, its handles to resize, or across empty track to draw a new one; double click resets. Zoomed out, a seven point average and band replace the raw line.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `{ date: Date \| number; value: number }[]` | – | Points in ascending time order. |
| `label` (required) | `string` | – | Names the chart for assistive technology. |
| `unit` | `string` | `""` | Unit after values in the tooltip and table. |
| `formatValue` | `(value: number) => string` | – | Formats values in the tooltip and table. |
| `formatTick` | `(value: number) => string` | – | Formats the value axis. Defaults to a compact number. |
| `formatDate` | `(date: Date) => string` | – | Formats dates in the tooltip and announcements. |
| `annotations` | `{ date: Date \| number; label: string; description?: string }[]` | `[]` | Events drawn as markers on both charts; labels show where they fit. |
| `range` | `[number, number]` | – | Controlled window as epoch milliseconds. A new value glides the window there. |
| `defaultRange` | `[number, number]` | – | Initial window when uncontrolled. Defaults to the whole series. |
| `onRangeChange` | `(range: [number, number]) => void` | – | Called while the window is dragged, resized, stepped, or reset. |
| `minSpan` | `number` | `7 days` | Smallest window in milliseconds. |
| `height` | `number` | `240` | Main plot height in pixels. |
| `overviewHeight` | `number` | `52` | Overview strip height in pixels. |
| `emptyLabel` | `string` | `"No data yet"` | Shown with fewer than two points. |
| `className` | `string` | – | Extra class on the figure. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| ArrowLeft / ArrowRight (plot) | Moves the crosshair between points in view. |
| ArrowLeft / ArrowRight (window) | Pans by a tenth of the window; Shift or PageUp and PageDown pan by half. |
| + / - (window) | Zooms in or out around the window's centre. |
| ArrowLeft / ArrowRight (handles) | Moves that edge by one point; Shift moves by ten. |
| Home / End | Moves the window or edge to the start or end. |
| Escape / 0 | Resets the window to the whole series. |

## Accessibility


- The window and both handles are sliders with dates as aria-valuetext.
- The plot is a focusable group; each reading is announced with its date, value, and any event on that day.
- A visually hidden table lists every point in the window with its event.
- Event markers pair the second series hue with a text label or tooltip; they never rely on color alone.

## Motion


- The line draws in from the left once, the first time it is seen.
- Dragging tracks the pointer 1:1; presets, resets, and controlled changes glide the window on a spring.
- The value axis springs to the tallest point in view, and the raw line crossfades with the smoothed trend as density changes.
- Reduced motion places the window directly and keeps the crosshair without travel.

## Responsive behavior


- Both charts fill their container; date ticks pick days, weeks, months, or years to fit the width.
- Handles have a 28 by 44px hit area for touch, and the strip keeps vertical page scroll free.
- Event labels are placed left to right and skip themselves when they would collide.

## Performance


- Past two points per pixel, each pixel column keeps only its low and high, so spikes survive and paths stay small.
- The overview path is built once per width; the rolling average is computed once per data change.
- Window moves re-render one component; a few thousand points stay smooth.

## Notes


- Choose it for long daily or hourly series where people need both the whole history and a close look.
- Control range to sync presets (30D, 90D, 1Y) or other charts with the window.
- Use annotations for launches, incidents, and pricing changes; keep labels to a word or two.
- The value axis starts at zero, so it suits counts and totals rather than prices that hover far from zero.

## Related

- [Line chart](/components/line-chart): A multi-series line chart with a gliding crosshair, legend toggles, and paths that morph between ranges.
- [Streamgraph](/components/streamgraph): Layered streams on a wiggle baseline that morph between ranges, with a layer you can isolate and read week by week.
- [Sparkline](/components/sparkline): Show a compact trend beside a value.
