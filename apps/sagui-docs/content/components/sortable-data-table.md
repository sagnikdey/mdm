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

### Search, filter and view options

`searchable` adds a search field that matches across visible columns. Columns marked `filterable` list their distinct values, with counts, in a Filter menu. `viewOptions` adds a View menu for showing and hiding columns; the first column always stays.

<!-- demo: Toolbar -->

### Resizable columns

`resizableColumns` adds a drag handle to the right edge of each header. Columns stay at least `minWidth` (64px by default), the last column fills the remaining space, and the table scrolls sideways once the columns are wider than it. Double-click a handle to reset that column, or set `resizable: false` on a column to fix its width.

### Empty

<!-- demo: Empty -->


## API reference


### SortableDataTable

A generic table with sortable columns, optional row selection, and rows that glide when re-sorted.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rows` (required) | `T[]` | – | Row objects. |
| `columns` (required) | `{ key: string; label: string; sortable?: boolean; render?: (value: unknown, row: T) => ReactNode; numeric?: boolean; width?: number \| string; filterable?: boolean; hideable?: boolean; searchable?: boolean; resizable?: boolean; minWidth?: number }[]` | – | Column definitions. Columns are sortable and searchable unless set false; numeric is detected when every value is a number; filterable adds the column to the Filter menu; hideable false keeps it out of the View menu. |
| `rowKey` (required) | `keyof T \| ((row: T) => string)` | – | Stable key per row. |
| `caption` | `string` | `"Data table"` | Table caption, used as its accessible name. |
| `emptyMessage` | `string` | `"No rows to show"` | Shown when rows is empty. |
| `defaultSort` | `{ key: string; direction: "asc" \| "desc" }` | – | Sort applied on first render. |
| `onSortChange` | `(sort: SortState) => void` | – | Called when a header is pressed. |
| `selectable` | `boolean` | `false` | Adds a checkbox column, row click selection, and a count line with Clear. |
| `selectedKeys` | `string[]` | – | Controlled selection. |
| `defaultSelectedKeys` | `string[]` | – | Initial selection when uncontrolled. |
| `onSelectionChange` | `(keys: string[]) => void` | – | Called with the new selection. |
| `searchable` | `boolean` | `false` | Adds a search field that matches rows across visible columns. |
| `searchPlaceholder` | `string` | `"Search"` | Placeholder for the search field. |
| `search` / `defaultSearch` | `string` | `""` | Controlled or initial search text. |
| `onSearchChange` | `(search: string) => void` | – | Called as the search text changes. |
| `filters` / `defaultFilters` | `Record<string, string[]>` | `{}` | Controlled or initial filters, keyed by column, listing accepted values. |
| `onFiltersChange` | `(filters: ColumnFilters) => void` | – | Called when a filter value is toggled or filters are cleared. |
| `viewOptions` | `boolean` | `false` | Adds a View menu for showing and hiding columns. |
| `hiddenColumns` / `defaultHiddenColumns` | `string[]` | `[]` | Controlled or initial hidden column keys. |
| `onHiddenColumnsChange` | `(keys: string[]) => void` | – | Called with the new hidden column keys. |
| `resizableColumns` | `boolean` | `false` | Adds drag handles on header edges. Arrow keys resize a focused handle; double-click resets. |
| `onColumnResize` | `(widths: Record<string, number>) => void` | – | Called with the pixel widths of resized columns when a resize ends. |
| `noResultsMessage` | `string` | `"No matching rows"` | Shown, with a Clear action, when search or filters match nothing. |
| `itemName` | `{ one: string; other: string }` | `{ one: "row", other: "rows" }` | Noun for the count line, as in "6 projects". |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| ArrowLeft / ArrowRight | Moves between sortable headers. |
| ArrowUp / ArrowDown | Moves between row checkboxes; down from Select all enters the rows. |
| Home / End | Jumps to the first or last header or row checkbox. |
| Enter / Space | Sorts by a header or toggles a checkbox. |
| Shift + click | Selects a range of rows. |
| ArrowLeft / ArrowRight on a resize handle | Narrows or widens the column by 16px; with Shift, 48px. |
| Escape | Clears the selection; in the search field, clears the search. |

## Accessibility


- A native table with caption, scoped headers, and aria-sort on sortable columns.
- Sort buttons are labelled like "Sort by Budget, currently ascending"; the select all checkbox shows a mixed state.
- The toolbar is a labelled role="toolbar"; filter and column options are toggle buttons with aria-pressed, grouped by column.
- Resize handles are focusable separators labelled like "Resize Owner", and keyboard resizes announce the new width.
- Result counts after a search or filter are announced, as in "3 of 8 projects shown".
- Sort and selection changes are announced through a role="status" region.

## Motion


- Rows glide to their new positions on a spring when the sort changes; the sort arrow flips.
- The selection count rolls and Clear fades in with a short blur.
- Reduced motion reorders instantly and fades the count.

## Responsive behavior


- Wider layouts scroll horizontally inside the table instead of the page.
- Below 620px each row folds into two lines, and the header becomes a scrolling strip of sort buttons with Select all pinned.
- Below 620px resize handles are hidden, since rows fold into cards.
- Below 620px the Filter and View buttons collapse to icons and search takes the remaining width.
- Hover row fills apply only on hover-capable fine pointers.

## Performance


- Rows are not virtualized and each uses position layout animation for re-sorts; paginate long lists with pagination.
- Sorting, search and filtering run client side over the rows you pass; for server-side search, control search and filters and pass the fetched rows.

## Notes


- Use for tabular records people sort and select. Use timeline for chronological activity and a plain list for simple items.
- Sorting is client side over the given rows; for server sorting, control defaultSort per fetch and page with pagination.
- Use render for badges, avatars, or formatted numbers inside cells.

## Related

- [Badge](/components/badge): A small label for status, category, or metadata.
- [Empty state](/components/empty-state): A useful next step when there is nothing to show yet.
- [Checkbox](/components/checkbox): A binary choice with a precise, legible state.
