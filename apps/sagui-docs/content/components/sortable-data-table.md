---
title: Sortable data table
slug: sortable-data-table
description: "Compare structured records with sortable columns."
category: data
component: SortableDataTable
keywords:
  - data
  - table
  - react data table
  - sortable table
  - table with row selection
  - animated table sort
  - responsive table
  - checkbox table
---

Compare structured records with sortable columns.

<!-- demo: Hero -->

## When to use


- Tabular records people sort and select, such as projects, invoices, or users.
- Tables that need Shift-click range selection and a count line with Clear.

## When not to use


- Use data-grid when people edit cells like a spreadsheet.
- Use timeline for chronological activity.
- Use reorderable-list when people set the order by hand.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { SortableDataTable } from "@sagui/ui";

const projects = [
  { id: "p1", name: "Harbour", owner: "Maya", budget: 42000 },
  { id: "p2", name: "Atlas", owner: "Leo", budget: 18500 },
];

export function Projects() {
  return (
    <SortableDataTable
      rows={projects}
      rowKey="id"
      caption="Projects"
      columns={[{ key: "name", label: "Name" }, { key: "owner", label: "Owner" }, { key: "budget", label: "Budget" }]}
      defaultSort={{ key: "name", direction: "asc" }}
      selectable
      itemName={{ one: "project", other: "projects" }}
    />
  );
}
```

## Examples

### Selectable rows

`selectable` adds a checkbox column, row click selection and a count line with Clear.

<!-- demo: Selectable -->

### Empty

<!-- demo: Empty -->


## API reference


### SortableDataTable

A generic table with sortable columns, optional row selection, and rows that glide when re-sorted.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rows` (required) | `T[]` | – | Row objects. |
| `columns` (required) | `{ key: string; label: string; sortable?: boolean; render?: (value: unknown, row: T) => ReactNode; numeric?: boolean; width?: number \| string }[]` | – | Column definitions. Columns are sortable unless sortable is false; numeric is detected when every value is a number. |
| `rowKey` (required) | `keyof T \| ((row: T) => string)` | – | Stable key per row. |
| `caption` | `string` | `"Data table"` | Table caption, used as its accessible name. |
| `emptyMessage` | `string` | `"No rows to show"` | Shown when rows is empty. |
| `defaultSort` | `{ key: string; direction: "asc" \| "desc" }` | – | Sort applied on first render. |
| `onSortChange` | `(sort: SortState) => void` | – | Called when a header is pressed. |
| `selectable` | `boolean` | `false` | Adds a checkbox column, row click selection, and a count line with Clear. |
| `selectedKeys` | `string[]` | – | Controlled selection. |
| `defaultSelectedKeys` | `string[]` | – | Initial selection when uncontrolled. |
| `onSelectionChange` | `(keys: string[]) => void` | – | Called with the new selection. |
| `itemName` | `{ one: string; other: string }` | `{ one: "row", other: "rows" }` | Noun for the count line, as in "6 projects". |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| ArrowLeft / ArrowRight | Moves between sortable headers. |
| ArrowUp / ArrowDown | Moves between row checkboxes; down from Select all enters the rows. |
| Home / End | Jumps to the first or last header or row checkbox. |
| Enter / Space | Sorts by a header or toggles a checkbox. |
| Shift + click | Selects a range of rows. |
| Escape | Clears the selection. |

## Accessibility


- A native table with caption, scoped headers, and aria-sort on sortable columns.
- Sort buttons are labelled like "Sort by Budget, currently ascending"; the select all checkbox shows a mixed state.
- Sort and selection changes are announced through a role="status" region.

## Motion


- Rows glide to their new positions on a spring when the sort changes; the sort arrow flips.
- The selection count rolls and Clear fades in with a short blur.
- Reduced motion reorders instantly and fades the count.

## Responsive behavior


- Wider layouts scroll horizontally inside the table instead of the page.
- Below 620px each row folds into two lines, and the header becomes a scrolling strip of sort buttons with Select all pinned.
- Hover row fills apply only on hover-capable fine pointers.

## Performance


- Rows are not virtualized and each uses position layout animation for re-sorts; paginate long lists with pagination.
- Sorting runs client side over the rows you pass.

## Notes


- Use for tabular records people sort and select. Use timeline for chronological activity and a plain list for simple items.
- Sorting is client side over the given rows; for server sorting, control defaultSort per fetch and page with pagination.
- Use render for badges, avatars, or formatted numbers inside cells.

## Related

- [Badge](/components/badge): A small label for status, category, or metadata.
- [Empty state](/components/empty-state): A useful next step when there is nothing to show yet.
- [Checkbox](/components/checkbox): A binary choice with a precise, legible state.
