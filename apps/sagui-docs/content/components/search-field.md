---
title: Search field
slug: search-field
description: "A recognizable search entry point with clear affordances."
category: inputs
component: SearchField
keywords:
  - field
  - search
  - react search input
  - search field
  - search bar with clear button
  - filter input
  - list filter search
---

A recognizable search entry point with clear affordances.

<!-- demo: Hero -->

## When to use


- Filtering a visible list or table in place.
- Toolbar search where the query should be clearable with one click.

## When not to use


- Use expanding-search for compact header search with results.
- Use combobox when the search sets a form value.
- Use filter-toolbar when search sits with other filters and sort.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { SearchField } from "@sagui/ui";

export function MemberFilter() {
  const [query, setQuery] = useState("");
  return (
    <SearchField
      label="Search members"
      placeholder="Name or email"
      value={query}
      onValueChange={setQuery}
    />
  );
}
```

## Examples

### Filtering a list

<!-- demo: FilterList -->


## API reference


### SearchField

A controlled search input with a clear button that scales in inside a reserved slot.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Visible label tied to the input. |
| `value` (required) | `string` | – | Current query. |
| `onValueChange` (required) | `(value: string) => void` | – | Called on every keystroke and with an empty string when cleared. |
| `...props` | `Omit<InputHTMLAttributes<HTMLInputElement>, "type">` | – | Forwarded to the input, including ref, placeholder, and name. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Escape | Clears the field (native type="search" behavior in most browsers). |

## Accessibility


- Native input type="search" with a real label.
- Clear button is labelled "Clear search" and returns focus to the input.
- The search icon is aria-hidden.

## Motion


- The clear button scales in from 0.8 with a slight blur on a snappy spring and presses to 0.96.
- Reduced motion fades it in and out without scale or blur; the reserved slot keeps the field width fixed either way.

## Responsive behavior


- The clear button has a reserved slot, so the field width never shifts when it appears.
- It fills its column with min-width 0 and shrinks inside narrow toolbars.

## Performance


- onValueChange fires on every keystroke; debounce expensive filtering or fetching yourself.

## Notes


- Use to filter a visible list in place. Use expanding-search for a compact header search with results, and combobox to choose a value.
- Always controlled: pass value and onValueChange, and debounce expensive filtering yourself.

## Related

- [Expanding search](/components/expanding-search): An icon that morphs into a search field with results beneath it.
