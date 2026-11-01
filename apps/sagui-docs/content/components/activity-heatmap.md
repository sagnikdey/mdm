---
title: Activity heatmap
slug: activity-heatmap
description: "See a year of activity at a glance, one square per day."
category: charts
component: ActivityHeatmap
keywords:
  - data
  - chart
  - calendar
  - react activity heatmap
  - contribution graph
  - github calendar heatmap
  - calendar heatmap
  - streak chart
  - activity calendar
---

See a year of activity at a glance, one square per day.

<!-- demo: Hero -->

## When to use


- Daily rhythm over a long range, like contributions or workouts.
- Views where streaks and quiet weeks matter more than exact comparison.

## When not to use


- Use bar-chart when the exact comparison is the point.
- Use calendar to pick dates.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { useState } from "react";
import { ActivityHeatmap } from "@sagui/ui";

export function Contributions({ days }: { days: { date: string; count: number }[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <ActivityHeatmap days={days} label="Contributions in 2026" period="2026" selectedDate={selected} onSelectDate={setSelected} />
  );
}
```

## Examples

### Selecting a day

Pass `selectedDate` and `onSelectDate` to ring a day and react to it. `weekStartsOn={1}` starts weeks on Monday.

<!-- demo: Selectable -->


## API reference


### ActivityHeatmap

A contribution style calendar with one tinted square per day and a hover or focus tooltip.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `days` (required) | `{ date: string; count: number }[]` | – | One entry per day as YYYY-MM-DD, oldest first. Missing days count as zero. |
| `label` (required) | `string` | – | Accessible name for the grid, such as "Contributions in 2025". |
| `period` (required) | `string` | – | Finishes the summary: "1,284 contributions in {period}". |
| `unit` | `{ one: string; other: string }` | `{ one: "contribution", other: "contributions" }` | Nouns for the count. |
| `thresholds` | `[number, number, number]` | – | Upper bounds for levels one to three. Defaults to quarters of the busiest day. |
| `weekStartsOn` | `0 \| 1` | `0` | Sunday or Monday as the first row. |
| `selectedDate` | `string \| null` | `null` | Day drawn with a selection ring. |
| `onSelectDate` | `(date: string) => void` | – | Called on click, Enter, or Space. |
| `actions` | `ReactNode` | – | Controls beside the summary, such as a range switch. |
| `locale` | `string` | `"en-US"` | Formatting locale. |
| `className` | `string` | – | Class for the root. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| ArrowUp / ArrowDown | Moves one day back or forward. |
| ArrowLeft / ArrowRight | Moves one week back or forward. |
| Home / End | Jumps to the first or last day. |
| Enter / Space | Selects the focused day. |
| Escape | Hides the tooltip. |

## Accessibility


- The grid is role="grid" with labelled gridcells and a hidden legend explaining the levels.
- Legend swatches are toggle buttons with aria-pressed that highlight days of one level.
- The total and hovered day are announced through status and polite live regions; the tooltip itself is aria-hidden.

## Motion


- Cells wave in once on view and a new range recolors the grid in a sweep.
- The tooltip glides between cells and its text rolls; the total counts to new values.
- Reduced motion drops the wave, sweep, and glide in favor of short fades.

## Responsive behavior


- Cells scale between 9px and 15px with the container, then the grid scrolls horizontally from the newest week.
- Below a 440px container the caption switches to a short form.
- On touch the tooltip lingers after a tap instead of hiding at once.

## Performance


- Every day is its own cell, so a year is about 370 elements; the reveal wave is capped in total time.
- One shared tooltip serves the whole grid.

## Notes


- Use when rhythm, streaks, and quiet weeks matter more than exact comparison. Use bar-chart when the exact comparison is the point.
- Pass a range switch through actions and swap days to change the period.

## Related

- [Bar chart](/components/bar-chart): Compare one measure across days and scrub any bar for its value.
- [Sparkline](/components/sparkline): Show a compact trend beside a value.
