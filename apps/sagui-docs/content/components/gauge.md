---
title: Gauge
slug: gauge
description: "Show a value against a known range."
category: charts
component: Gauge
keywords:
  - data
  - chart
  - react gauge
  - gauge chart
  - radial meter
  - progress ring
  - threshold gauge
  - dashboard gauge
---

Show a value against a known range.

<!-- demo: Hero -->

## When to use


- One value against a known range, such as disk quota or health score.
- Values with labelled bands, like Healthy, Filling up, and Critical.

## When not to use


- Use progress for task completion.
- Use usage-meter for plan limits and activity-rings for several goals at once.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Gauge } from "@sagui/ui";

export function DiskUsage() {
  return (
    <Gauge
      label="Disk usage"
      value={72}
      detail="360 of 500 GB"
      thresholds={[
        { from: 0, tone: "success", label: "Healthy" },
        { from: 70, tone: "warning", label: "Filling up" },
        { from: 90, tone: "danger", label: "Critical" },
      ]}
    />
  );
}
```

## Examples

### Changing value

The ring springs to the new value while the percent counts, and the band label changes exactly as it crosses a threshold.

<!-- demo: Changing -->

### Ranges and tones

Any `min` and `max` work; without thresholds the `tone` sets the color.

<!-- demo: Tones -->


## API reference


### Gauge

A 270 degree ring meter with a percent readout and optional labelled threshold bands.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` (required) | `number` | – | Current value within min and max. |
| `min` | `number` | `0` | Lower bound. |
| `max` | `number` | `100` | Upper bound. |
| `label` (required) | `string` | – | What is measured. |
| `detail` | `string` | – | Secondary caption line. |
| `tone` | `"accent" \| "success" \| "warning" \| "danger"` | `"accent"` | Ring color when no threshold applies. `accent` uses the primary color. |
| `thresholds` | `{ from: number; tone: "accent" \| "success" \| "warning" \| "danger"; label: string }[]` | – | Bands by starting value. The highest band reached sets the tone and shows its label. |

## Accessibility


- The ring is role="meter" with aria-valuemin, aria-valuemax, aria-valuenow, and an aria-valuetext including the band label.
- Threshold labels name the state in text, so it never rests on color alone.
- The SVG and animated readout are aria-hidden.

## Motion


- The ring fills once when half in view without overshoot, then springs to new values while the percent counts.
- The band color and label change exactly as the count crosses a threshold.
- Reduced motion lands on the value at once.

## Responsive behavior


- The ring is min(100%, 176px) wide and keeps its aspect ratio, so it shrinks in narrow columns.

## Performance


- It fills once when half in view, then springs to new values; it is one SVG arc with no running loop.

## Notes


- Use for one value against a known range, such as quota or health. Use progress for task completion and usage-meter for plan limits.
- Always add thresholds with labels when tone carries meaning.
