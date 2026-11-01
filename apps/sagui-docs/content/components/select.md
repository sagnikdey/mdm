---
title: Select
slug: select
description: "A compact choice field with a keyboard friendly menu."
category: selection
component: Select
keywords:
  - field
  - form
  - react select
  - dropdown select
  - radix select
  - animated select
  - select menu
  - form select field
---

A compact choice field with a keyboard friendly menu.

<!-- demo: Hero -->

## When to use


- A short fixed list where typing is not needed, such as region or sort order.
- Form fields that should submit natively through Radix's hidden select via name.

## When not to use


- Use combobox for long or searchable lists.
- Use multi-select when several values can be chosen.
- Use segmented-control for two to four choices that should stay visible.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Select } from "@sagui/ui";

export function RegionSelect() {
  const [region, setRegion] = useState("eu");
  return (
    <Select
      label="Region"
      value={region}
      onValueChange={setRegion}
      options={[
        { value: "us", label: "United States" },
        { value: "eu", label: "Europe" },
        { value: "ap", label: "Asia Pacific", disabled: true },
      ]}
    />
  );
}
```

## Examples

### Placeholder

<!-- demo: Placeholder -->

### With an error

<!-- demo: WithError -->

### Disabled

<!-- demo: Disabled -->


## API reference


### Select

A labelled Radix select whose shown value rolls in the direction of the list.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Visible label for the trigger. |
| `options` (required) | `{ value: string; label: string; disabled?: boolean }[]` | – | Items in list order. |
| `placeholder` | `string` | `"Select an option"` | Shown when no value is selected. |
| `description` | `string` | – | Helper copy under the trigger, linked through aria-describedby. |
| `error` | `string` | – | Error copy. Colors the border, sets aria-invalid, and is announced as an alert. |
| `id` | `string` | – | Trigger id. Generated when omitted. |
| `className` | `string` | – | Added to the trigger. |
| `...props` | `Omit<SelectPrimitive.SelectProps, "children">` | – | Radix Select root props: value, defaultValue, onValueChange, open, onOpenChange, name, required, disabled. ref goes to the trigger button. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / Space / ArrowDown | Opens the list from the trigger. |
| ArrowUp / ArrowDown | Moves between enabled items. |
| Enter / Space | Selects the highlighted item and closes. |
| Escape | Closes without changing the value. |
| Type a letter | Jumps to the next item starting with it (Radix typeahead). |

## Accessibility


- Built on Radix Select, so the trigger, listbox, and options get the right roles and focus handling.
- The real value renders in a visually hidden Radix Value; the animated copy is aria-hidden.
- Label is linked with htmlFor, and description through aria-describedby.

## Motion


- A later option rises in from below and an earlier one drops from above, with a soft blur.
- Reduced motion swaps the value with an instant crossfade.

## Responsive behavior


- The menu matches the trigger width, caps at min(24rem, 100vw minus 20px), and at 320px or the available height, then scrolls.
- Long labels ellipsize in the trigger instead of widening it.
- The trigger never scales on press, so Radix measures a stable anchor on touch.

## Performance


- The menu renders in a Radix portal only while open; items are not virtualized, so keep the list short.
- The translucent menu drops its backdrop blur under prefers-reduced-transparency.

## Notes


- Pick for a short fixed list where typing is not needed. Use combobox for long or searchable lists, multi-select for several values, and segmented-control for two to four visible choices.
- Controlled with value and onValueChange, or uncontrolled with defaultValue; pass name to submit with a form.

## Related

- [Combobox](/components/combobox): Search and select from a list without leaving the field.
- [Multi-select](/components/multi-select): Select several values while keeping the field readable.
- [Radio group](/components/radio-group): Choose one option from a visible set.
