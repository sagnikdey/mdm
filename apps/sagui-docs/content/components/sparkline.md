---
title: Sparkline
slug: sparkline
description: "Show a compact trend beside a value."
category: charts
component: Sparkline
keywords:
  - data
  - chart
  - react sparkline
  - mini line chart
  - trend line
  - inline chart
  - scrubbable chart
  - svg sparkline
---

Show a compact trend beside a value.

<!-- demo: Hero -->

## When to use


- A compact trend inside a card, table row, or KPI tile.
- Small charts people can scrub by pointer or keyboard to read past values.

## When not to use


- Use bar-chart for comparing discrete periods with axes.
- Use stat-card or metric-card when only the latest value matters.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Sparkline } from "@sagui/ui";

export function Signups() {
  return (
    <Sparkline
      label="Signups"
      data={[12, 18, 15, 22, 30, 27, 34]}
      labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
      value="34"
      change="+26%"
      tone="success"
    />
  );
}
```

## Examples

### Tones

<!-- demo: Tones -->

### Without scrubbing

`interactive={false}` makes it a static trend.

<!-- demo: Static -->


## API reference


### Sparkline

A small line chart with a headline value that can be scrubbed by pointer or keyboard.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `number[]` | – | Points in order, oldest first. |
| `label` (required) | `string` | – | What is measured. Names the chart. |
| `value` | `string` | – | Headline value at rest. While scrubbing it shows the point under the cursor. |
| `change` | `string` | – | Aside text at rest, such as "+4.1%". |
| `tone` | `"accent" \| "success" \| "warning" \| "danger"` | `"accent"` | Line and change color. `accent` uses the primary color. |
| `width` | `number` | `160` | Drawing width in SVG units. |
| `height` | `number` | `52` | Drawing height in SVG units. |
| `labels` | `string[]` | – | One label per point, such as a date, shown while scrubbing. |
| `formatValue` | `(value: number, index: number) => string` | – | Formats a scrubbed point. Defaults to a grouped number. |
| `area` | `boolean` | `true` | Quiet fill under the line. |
| `interactive` | `boolean` | `true` | Enables pointer and keyboard scrubbing. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| ArrowLeft / ArrowRight | Moves the cursor one point back or forward (ArrowDown and ArrowUp too). |
| PageDown / PageUp | Moves about a sixth of the series. |
| Home / End | Jumps to the first or last point. |
| Escape | Stops scrubbing and returns to the latest value. |

## Accessibility


- The figure has an aria-label describing the series; the SVG is hidden.
- When interactive, the plot is a focusable role="slider" whose aria-valuetext reads the point label and value.
- Pass labels so scrubbed points read as dates rather than positions.

## Motion


- The line draws in on first view and the end dot appears as it lands.
- While scrubbing, the cursor springs between points, later points dim, and headline copy rolls.
- Reduced motion shows the full line at once and moves the cursor without springing.

## Responsive behavior


- The plot measures its width with a ResizeObserver and redraws to fill its container.
- Scrubbing uses touch-action pan-y, so a horizontal drag scrubs while vertical swipes still scroll the page.
- On touch the readout returns to the latest value when the finger lifts.

## Performance


- Each chart has its own ResizeObservers and an in-view draw; set interactive to false in dense tables to drop tab stops and handlers.

## Notes


- Use for a compact trend inside a card or table row. Use bar-chart for comparing discrete periods with axes.
- Pass value as the formatted latest reading; formatValue should match it so scrubbed values look consistent.
- Set interactive to false in dense tables to avoid many tab stops.

## Related

- [Bar chart](/components/bar-chart): Compare one measure across days and scrub any bar for its value.
- [Metric card](/components/metric-card): A compact summary for a number that needs context.
- [Gauge](/components/gauge): Show a value against a known range.
