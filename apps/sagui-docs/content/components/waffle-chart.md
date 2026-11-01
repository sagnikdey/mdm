---
title: Waffle chart
slug: waffle-chart
description: "A ten by ten unit chart where every cell is one percent, and cells fly to their new group when the data changes."
category: charts
component: WaffleChart
keywords:
  - data
  - chart
  - new
  - waffle chart
  - unit chart
  - square pie chart
  - percentage grid
  - part to whole chart
  - react waffle chart
  - animated waffle
  - isotype chart
---

A ten by ten unit chart where every cell is one percent, and cells fly to their new group when the data changes.

<!-- demo: Hero -->

## When to use


- Showing shares of one whole where people should be able to count units.
- Comparing the same categories across a few datasets, such as countries or years.
- Replacing a pie or donut when small shares need to stay visible.

## When not to use


- Use line-chart or streamgraph for how shares change over time.
- Use bar-chart when exact comparison of many categories matters more than the whole.
- Use sunburst for nested parts of a whole.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { WaffleChart } from "@sagui/ui";

const mix = [
  { key: "wind-solar", label: "Wind and solar", value: 218 },
  { key: "hydro", label: "Hydro", value: 20 },
  { key: "gas", label: "Gas", value: 76 },
  { key: "coal", label: "Coal", value: 132 },
  { key: "other", label: "Other", value: 61 },
];

export function PowerMix() {
  return <WaffleChart data={mix} label="Electricity generation, 2023" unit="TWh" />;
}
```

## Examples

### Changing the data

Each cell follows its category and flies to the new block when the data changes.

<!-- demo: Years -->


## API reference


### WaffleChart

A unit chart where every cell is one share of the whole. When the data changes, cells keep following their category and fly to their new block with a staggered spring, and the shares in the legend roll to their new values.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` (required) | `WaffleCategory[]` | – | Categories in fill order: { key, label, value, color? }. The first fills from the bottom-left corner, column by column. Shares come from the total. |
| `label` (required) | `string` | – | What the whole is, such as "Electricity generation, 2023". Names the chart, the summary, and the table. |
| `unit` | `string` | `""` | Unit after raw values in the tooltip and table, such as "TWh". |
| `formatValue` | `(value: number, category: WaffleCategory) => string` | – | Formats raw values. Shares are always percentages. |
| `rows` | `number` | `10` | Grid rows. rows × columns cells make the whole. |
| `columns` | `number` | `10` | Grid columns. 10 × 10 means one cell per percent. |
| `accentKey` | `string \| null` | `first key` | The category painted in the first chart color (`--color-chart-1`). The next three take chart colors 2 to 4 and later ones fall back to neutral steps. |
| `activeKey` | `string \| null` | – | Controlled focused category. Other cells dim while one is focused. |
| `defaultActiveKey` | `string \| null` | `null` | Initial focused category when uncontrolled. |
| `onActiveChange` | `(key: string \| null) => void` | – | Called when a legend item is pinned or released. |
| `legend` | `boolean` | `true` | Category list with rolling shares. It sits beside the grid from 420px and below it on narrower containers. |
| `decimals` | `number` | `0` | Decimal places for shares. |
| `emptyLabel` | `string` | `"No data"` | Message when the data is empty or sums to zero. |
| `ref` | `Ref<HTMLElement>` | – | Forwarded to the figure. |
| `className` | `string` | – | Extra class on the figure. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Tab | Focuses the grid, then each legend item. |
| Arrow keys | Move the reading cell by cell across the grid. |
| PageUp / PageDown | Jump to the first cell of the previous or next category. |
| Home / End | Go to the first or last filled cell. |
| Escape | Clears the reading. |
| Enter / Space on a legend item | Pins or releases that category. |

## Accessibility


- The grid is a focusable group with a roledescription and instructions; cells are decorative and aria-hidden.
- A polite live region reads the category, share, and value under the keyboard cursor.
- A visually hidden summary and a table list every category with its value, share, and cell count.
- Legend items are toggle buttons with aria-pressed; identity never relies on colour alone because every category is named in the legend.

## Motion


- Cells are persistent: a data change keeps as many cells in place as possible and flies the rest to their new block, staggered by position so the grid refills like a wave.
- A travelling cell dips in scale mid-flight and changes colour with the same delay, so it reads as lifting out of one group and landing in another.
- Shares in the legend roll to their new values on a critically damped spring.
- The first time the chart is seen, cells pop in from the bottom-left corner.
- Reduced motion places cells and shares immediately and drops the dip, pop, and stagger.

## Responsive behavior


- The grid is square and fills up to 300px; the legend moves beside it from 420px of container width.
- Legend labels truncate with an ellipsis; the full name stays in the tooltip, the live region, and the table.
- Touch reads cells with a press and drag; the page still scrolls vertically.

## Performance


- One element per cell, 100 by default, animated with transforms only.
- Hover is resolved from pointer position arithmetic, not per-cell listeners.
- Grid size is measured with one ResizeObserver.

## Notes


- Choose it for part-to-whole with four to eight categories where countable units help, such as energy mix, survey answers, or budget split.
- Keep categories in a meaningful order; the fill order is the reading order.
- Use accentKey for the category the story is about and leave the rest neutral.
- Switching datasets with the same keys is where it shines: cells travel instead of repainting.

## Related

- [Donut chart](/components/donut-chart): A donut whose arcs morph between datasets, with the active value rolling into the center.
- [Bar chart](/components/bar-chart): Compare one measure across days and scrub any bar for its value.
