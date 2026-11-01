---
title: Pagination
slug: pagination
description: "Move through the pages of a long table or list."
category: navigation
component: Pagination
keywords:
  - pagination
  - pager
  - pages
  - next page
---

Move through the pages of a long table or list.

<!-- demo: Hero -->

## When to use

- A table or list has more records than one page shows. Place it directly under what it controls.

## When not to use

- Use stepper for steps of a flow, and tabs for switching views.
- Hide it when there are fewer than two pages.

## Usage

```tsx
import { Pagination } from "@sagui/ui";

<Pagination page={page} pageCount={25} onPageChange={setPage} summary="Showing 21–30 of 248" />
```

SortableDataTable includes it: set `pageSize`.

## Examples

### Compact

<!-- demo: Compact -->

## API reference

### Pagination

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | `number` | – | Current page, starting at 1. |
| `pageCount` | `number` | – | Total number of pages. |
| `onPageChange` | `(page: number) => void` | – | Called with the requested page. |
| `summary` | `ReactNode` | – | Visible range, shown at the start. |
| `layout` | `"auto" \| "full" \| "compact"` | `"auto"` | Auto shows the compact layout on narrow screens. |

## Accessibility

- A `nav` landmark labelled by `aria-label`; override it when a page has several.
- The current page sets `aria-current="page"`, and page buttons are named "Page N".
- Previous is disabled on the first page and Next on the last.

## Related

- [Data table](/components/sortable-data-table): Compare structured records with sortable columns.
