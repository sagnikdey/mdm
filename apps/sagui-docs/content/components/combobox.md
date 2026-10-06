---
title: Combobox
slug: combobox
description: "Search and select from a list without leaving the field."
category: selection
component: Combobox
keywords:
  - field
  - search
  - react combobox
  - autocomplete
  - searchable select
  - typeahead dropdown
  - filterable select
  - autocomplete input
---

Search and select from a list without leaving the field.

<!-- demo: Hero -->

## When to use


- Single-choice fields with long lists, such as time zones or countries.
- Lists where people know the name and want to type, including aliases via keywords.

## When not to use


- Use select for a short list where typing adds nothing.
- Use multi-select when several values can be chosen.
- Use expanding-search when the search navigates instead of setting a value.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Combobox } from "@sagui/ui";

const timezones = [
  { value: "utc", label: "UTC" },
  { value: "cet", label: "Central European", keywords: ["zurich", "berlin"] },
  { value: "pst", label: "Pacific", keywords: ["san francisco"] },
];

export function TimezoneField() {
  const [zone, setZone] = useState("");
  return <Combobox label="Time zone" options={timezones} value={zone} onValueChange={setZone} />;
}
```

## Examples

### With a value

The chosen label stays in the field as a placeholder while you search.

<!-- demo: Selected -->

### With an error

<!-- demo: WithError -->


## API reference


### Combobox

A searchable single-select field: type to filter, pick from a listbox that follows its height on a spring.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Visible label, also used to name the listbox. |
| `options` (required) | `ComboboxOption[]` | – | { value, label, disabled?, keywords? }. Keywords also match the query. |
| `value` | `string` | – | Controlled selected value. Empty string means none. |
| `defaultValue` | `string` | `""` | Initial value when uncontrolled. |
| `onValueChange` | `(value: string) => void` | – | Called with the new value, or an empty string when cleared. |
| `description` | `string` | – | Helper copy under the field, linked through aria-describedby. |
| `error` | `string` | – | Error copy. Colors the border, sets aria-invalid, and is announced as an alert. |
| `placeholder` | `string` | `"Search or select…"` | Shown when nothing is selected. While searching, the chosen label shows here instead. |
| `emptyMessage` | `string` | `"No matches found"` | Shown in a status row when the filter matches nothing. |
| `className` | `string` | – | Added to the control wrapper. |
| `...props` | `Omit<InputHTMLAttributes<HTMLInputElement>, "value" \| "defaultValue" \| "onChange" \| "placeholder">` | – | Forwarded to the input, including ref, id, name, disabled, and onFocus. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| ArrowDown / ArrowUp | Opens the list, then moves through enabled options, wrapping at the ends. |
| Enter | Selects the active option. |
| Escape | Closes the list and discards the query. |

## Accessibility


- Input has role="combobox" with aria-expanded, aria-controls, aria-autocomplete="list", and aria-activedescendant.
- Options use role="option" with aria-selected and aria-disabled; the list is labelled "<label> options".
- The empty state is a role="status" row; the clear button is labelled "Clear selection".

## Motion


- The popover springs in from slightly above and the listbox height follows filtering on a smooth spring.
- A chosen label rises into the field with a soft blur; the clear button scales in.
- Reduced motion keeps opacity-only fades and instant height changes.

## Responsive behavior


- The popover spans the field width and the listbox caps at min(300px, 40vh), scrolling with contained overscroll.
- It closes on any pointerdown outside, so a tap elsewhere dismisses it on touch.

## Performance


- Filtering is memoized and runs on every keystroke across all options; results are not virtualized, so pre-filter very large lists.
- A ResizeObserver drives the listbox height spring while filtering.

## Notes


- Use for long or searchable single-choice lists. Use select for short lists, multi-select for several values, and expanding-search for search that navigates.
- Controlled with value and onValueChange, or uncontrolled with defaultValue. The input shows the label, not the value, so pair name with a hidden input if you post a form.
- Add keywords to options for synonyms and aliases.

## Related

- [Select](/components/select): A compact choice field with a keyboard friendly menu.
- [Multi-select](/components/multi-select): Select several values while keeping the field readable.
- [Expanding search](/components/expanding-search): An icon that morphs into a search field with results beneath it.
- [Search field](/components/search-field): A recognizable search entry point with clear affordances.
