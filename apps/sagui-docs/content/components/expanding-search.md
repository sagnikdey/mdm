---
title: Expanding search
slug: expanding-search
description: "An icon that morphs into a search field with results beneath it."
category: inputs
component: ExpandingSearch
keywords:
  - search
  - field
  - motion
  - react expanding search
  - search icon expand
  - animated search bar
  - header search
  - search with results dropdown
  - collapsible search
---

An icon that morphs into a search field with results beneath it.

<!-- demo: Hero -->

## When to use


- Header or toolbar search where a full field would crowd the layout.
- Quick navigation across local items with grouped results and recent suggestions.

## When not to use


- Use search-field to filter a visible list in place.
- Use combobox to set a form value.
- Use command-palette for searching commands across the app.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { ExpandingSearch } from "@sagui/ui";

export function HeaderSearch() {
  const router = useRouter();
  return (
    <ExpandingSearch
      label="Search projects and docs"
      items={[
        { id: "p1", title: "Arc website", group: "Projects", meta: "Updated today" },
        { id: "d1", title: "Motion tokens", group: "Docs", keywords: ["spring"] },
      ]}
      onSelect={(item) => router.push(`/items/${item.id}`)}
    />
  );
}
```

## Examples

### With recent searches

`suggestions` shows before anything is typed, such as recent searches.

<!-- demo: WithSuggestions -->

### Anchored at the start

`anchor` picks the edge the button sits on. The field grows away from it.

<!-- demo: AnchoredStart -->


## API reference


### ExpandingSearch

An icon button that morphs into a search field with grouped, highlighted results beneath it.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Names the button, field, and results, such as "Search projects and docs". |
| `items` (required) | `ExpandingSearchItem[]` | – | { id, title, meta?, group?, icon?, keywords? }. Filtered client-side by title and keywords. |
| `suggestions` | `ExpandingSearchItem[]` | `[]` | Shown before anything is typed, such as recent searches. |
| `suggestionsLabel` | `string` | `"Recent"` | Heading for suggestions. |
| `placeholder` | `string` | – | Field placeholder. Defaults to label. |
| `onSelect` | `(item: ExpandingSearchItem) => void` | – | Called when a result is chosen; the field then folds back. |
| `onExpandedChange` | `(expanded: boolean) => void` | – | Called when the field opens or folds. |
| `expandedWidth` | `number` | `360` | Widest the field grows, never past its container. |
| `maxResults` | `number` | `6` | Most results shown. |
| `anchor` | `"start" \| "end"` | `"end"` | Edge the button sits on; the field grows away from it. |
| `emptyHint` | `string` | `"Try a shorter word or check the spelling."` | Tip under the empty state. |
| `className` | `string` | – | Added to the root. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / Space | On the icon button, expands the field. |
| ArrowDown / ArrowUp | Moves through results, wrapping. |
| Enter | Chooses the active result. |
| Escape | Folds the field back into the icon. |

## Accessibility


- The field is role="combobox" with aria-expanded, aria-controls, aria-autocomplete="list", and aria-activedescendant.
- Results are a role="listbox" of role="option" items inside labelled role="group" sections.
- Result counts and empty states are announced through a polite live region; the collapsed field is inert.

## Motion


- The button morphs into the field on a spring, results unfold beneath with a panel that tracks the field width, and a highlight travels between options.
- Reduced motion swaps states with fades and no width or position travel.

## Responsive behavior


- The field grows to the smaller of expandedWidth and its container, and a ResizeObserver follows container resizes.
- The results panel matches the field width and caps at min(22rem, 60vh), scrolling itself.
- The idle lane takes no pointer events, so it never blocks what sits under it on small screens.

## Performance


- Ranking is memoized and runs over all items per query; pass pre-filtered or server results for large sets.
- Result rows use layout position animation, capped by maxResults at 6 by default.

## Notes


- Use in headers and toolbars where a full field would crowd the layout. Use search-field to filter a list in place and combobox to set a form value.
- Place it in the space it may grow into; it fills that space up to expandedWidth. Filtering is local, so pass pre-fetched items or update items as the query changes.
- Exported as both named and default.

## Related

- [Search field](/components/search-field): A recognizable search entry point with clear affordances.
