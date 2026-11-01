---
title: Treemap
slug: treemap
description: "A squarified treemap: click to drill and the tiles grow to fill the view, with a breadcrumb back and metrics that morph every tile."
category: charts
component: Treemap
keywords:
  - data
  - chart
  - new
  - treemap
  - tree map
  - squarified
  - hierarchy
  - part to whole
  - drill down
  - zoomable treemap
---

A squarified treemap: click to drill and the tiles grow to fill the view, with a breadcrumb back and metrics that morph every tile.

<!-- demo: Hero -->

## When to use


- Many parts where the biggest ones matter and people drill for detail.
- Showing size and a second measure at once.

## When not to use


- Use bar-chart when exact comparisons between similar values matter.
- Use sunburst when the depth of the hierarchy is the story.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Treemap } from "@sagui/ui";

const data = {
  id: "all", label: "All regions",
  children: [
    { id: "na", label: "North America", children: [{ id: "us", label: "United States", value: 18400, color: 24 }, { id: "ca", label: "Canada", value: 2350, color: 19 }] },
    { id: "eu", label: "Europe", children: [{ id: "de", label: "Germany", value: 4120, color: 28 }] },
  ],
};

export function Revenue() {
  return <Treemap data={data} label="ARR" colorLabel="Growth" formatColor={value => `+${value}%`} />;
}
```

## Examples

### Starting inside a branch

`defaultFocus` opens the map already drilled into a branch. Without `colorLabel` every tile shares its branch hue.

<!-- demo: Focused -->


## API reference


### Treemap

A squarified treemap of a hierarchy. Click a branch and its tile grows to fill the view while its children open inside; the breadcrumb zooms back out. Switching the size or shading measure morphs every tile.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `TreemapNode` | – | The root: { id, label, value?, color?, children? }. A branch's value is the sum of its children. |
| `label` (required) | `string` | – | What the whole is. Names the chart for assistive technology. |
| `formatValue` | `(value: number) => string` | – | Formats sizes on tiles, the total, and the tooltip. |
| `colorLabel` | `string` | – | Names the shading measure, such as "Growth". Tiles take the hue of their top level branch and deepen with the measure. Leave it out for one depth. |
| `formatColor` | `(value: number) => string` | – | Formats the shading measure. |
| `colorDomain` | `[number, number]` | – | Range of the shading measure. Defaults to the range of the leaves. |
| `focus` | `string` | – | Controlled id of the node that fills the view. |
| `defaultFocus` | `string` | – | Initial focus when uncontrolled. Defaults to the root. |
| `onFocusChange` | `(id: string) => void` | – | Called when people drill in or out. |
| `height` | `number` | `420` | Height of the tiles in pixels. |
| `emptyLabel` | `string` | `"No data yet"` | Shown when every value is zero. |
| `className` | `string` | – | Extra class on the root figure. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Arrow keys | Move to the nearest top level tile in that direction. |
| Home / End | Move to the first or last tile. |
| Enter / Space | Zooms into the tile in focus. |
| Escape / Backspace | Zooms out one level. |

## Accessibility


- The tiles form a focusable group with a description of its keys; the breadcrumb is a nav with aria-current on the current level.
- The tile in focus is announced with its path, value, share of parent, and shading measure through a polite live region.
- A visually hidden table lists every node's path, value, share, and measure.

## Motion


- Drilling in carries every tile through one affine zoom: the chosen tile grows to fill the view, its siblings fly outward, and its children open inside it.
- Zooming out reverses the same path, so each level shrinks back into the tile it came from.
- Changing a measure re-lays out the same ids, so tiles resize and recolor in place; totals roll and breadcrumbs slide.
- Text never scales: tiles are sized each frame and labels appear only where they fit. Reduced motion places tiles immediately.

## Responsive behavior


- The layout squarifies to the measured width, so tiles stay close to square on any screen; headers and labels hide where they would not fit.
- Tap a tile to read it, tap a branch to drill in.

## Performance


- Layouts are computed per focus; animation interpolates rects and writes transforms and sizes directly. Comfortable up to a few hundred nodes.

## Notes


- Choose it for part-to-whole across a hierarchy with many leaves, such as revenue by region, country, and plan.
- Give nodes stable ids so switching the size measure morphs rather than rebuilds.
- The shading measure should be a magnitude (growth, margin), not identity; identity comes from the top level hue.
- Colors come from the chart palette, `--color-chart-1` to `--color-chart-4`, which has light and dark values. Override `--sg-chart-1` to `--sg-chart-4` on any ancestor to rebrand a chart. Pair color with labels, since the palette is not tuned for every type of color vision.

## Related

- [Donut chart](/components/donut-chart): A donut whose arcs morph between datasets, with the active value rolling into the center.
- [Bar chart](/components/bar-chart): Compare one measure across days and scrub any bar for its value.
- [Waffle chart](/components/waffle-chart): A ten by ten unit chart where every cell is one percent, and cells fly to their new group when the data changes.
