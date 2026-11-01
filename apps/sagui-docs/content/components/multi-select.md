---
title: Multi-select
slug: multi-select
description: "Select several values while keeping the field readable."
category: selection
component: MultiSelect
keywords:
  - field
  - choice
  - react multi select
  - multiselect dropdown
  - select multiple options
  - multi select chips
  - tag select
  - checkbox dropdown
---

Select several values while keeping the field readable.

<!-- demo: Hero -->

## When to use


- Picking several values from a fixed list in a compact field, such as labels or assignees.
- Filters where the chosen values should show in the field with a +N overflow.

## When not to use


- Use chip-group when every option should stay visible.
- Use tag-input for free-form values.
- Use select for a single value.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { MultiSelect } from "@sagui/ui";

export function LabelPicker() {
  const [labels, setLabels] = useState<string[]>(["bug"]);
  return (
    <MultiSelect
      label="Labels"
      value={labels}
      onValueChange={setLabels}
      options={[
        { value: "bug", label: "Bug" },
        { value: "feature", label: "Feature" },
        { value: "docs", label: "Docs" },
      ]}
    />
  );
}
```

## Examples

### Many selections

Chips beyond `maxVisible` collapse into a "+n" that rolls as the count changes.

<!-- demo: ManySelected -->

### With an error

<!-- demo: WithError -->


## API reference


### MultiSelect

A dropdown that picks several values, showing them as chips with a rolling +N overflow count.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Visible label, also names the listbox. |
| `options` (required) | `MultiSelectOption[]` | – | { value, label, disabled? } in list order. |
| `value` | `string[]` | – | Controlled selected values. |
| `defaultValue` | `string[]` | `[]` | Initial values when uncontrolled. |
| `onValueChange` | `(value: string[]) => void` | – | Called with the full new selection. |
| `placeholder` | `string` | `"Select options"` | Shown when nothing is selected. |
| `description` | `string` | – | Helper copy under the field. |
| `error` | `string` | – | Error copy. Colors the border, sets aria-invalid, and is announced as an alert. |
| `maxVisible` | `number` | `2` | Chips shown in the trigger before the rest collapse into +N. |
| `disabled` | `boolean` | `false` | Disables the trigger and hides the clear button. |
| `className` | `string` | – | Added to the root. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / Space | Opens or closes the list; Enter toggles the active option while open. |
| ArrowDown / ArrowUp | Opens the list and moves through enabled options, wrapping. |
| Escape | Closes the list. |

## Accessibility


- Trigger has aria-haspopup="listbox", aria-expanded, and aria-labelledby combining the label and a hidden list of selected labels.
- The menu is role="listbox" with aria-multiselectable; options carry aria-selected and aria-disabled.
- Clear button is labelled "Clear selections"; chips are aria-hidden in favor of the spoken summary.

## Motion


- Chips open their slot width on a smooth spring and grow in from 0.9 with a blur; the +N count rolls up or down.
- Checks draw in the menu; the menu springs in from slightly above.
- Reduced motion turns every change into a short crossfade with no scale or width travel.

## Responsive behavior


- Chips cap at 9rem and ellipsize, and maxVisible limits how many show before +N, so the trigger holds one line.
- The menu spans the field width and has no max height or scroll, so keep option lists short on small screens.

## Performance


- Options are not virtualized and the menu does not scroll; for long lists use combobox instead.
- Chips animate slot width and scale per change; fine for a few selections.

## Notes


- Use for picking several values from a fixed list in a compact field. Use chip-group when all options should stay visible and tag-input for free-form values.
- Controlled with value and onValueChange or uncontrolled with defaultValue. There is no name prop, so serialize the array yourself for forms.

## Related

- [Select](/components/select): A compact choice field with a keyboard friendly menu.
- [Combobox](/components/combobox): Search and select from a list without leaving the field.
- [Tag input](/components/tag-input): Turn short text values into removable tags.
