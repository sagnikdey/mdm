---
title: Radio group
slug: radio-group
description: "Choose one option from a visible set."
category: selection
component: RadioGroup
keywords:
  - field
  - choice
  - react radio group
  - radio buttons
  - radio cards
  - plan picker
  - animated radio
  - radio with description
---

Choose one option from a visible set.

<!-- demo: Hero -->

## When to use


- Two to six mutually exclusive options that need descriptions, such as plans.
- Form choices that should submit natively through name.

## When not to use


- Use segmented-control for short inline view options.
- Use select for longer lists.
- Use checkbox when several options can be on at once.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { RadioGroup } from "@sagui/ui";

export function PlanPicker() {
  const [plan, setPlan] = useState("team");
  return (
    <RadioGroup
      label="Plan"
      name="plan"
      value={plan}
      onValueChange={setPlan}
      options={[
        { value: "solo", label: "Solo", description: "One seat" },
        { value: "team", label: "Team", description: "Up to 20 seats" },
      ]}
    />
  );
}
```

## Examples

### Uncontrolled

Pass `defaultValue` and skip the state.

<!-- demo: Uncontrolled -->

### A disabled option

A disabled option is skipped by the arrow keys and dimmed.

<!-- demo: DisabledOption -->


## API reference


### RadioGroup

A fieldset of native radios where one highlight glides to the chosen row.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Rendered as the fieldset legend. |
| `options` (required) | `{ value: string; label: string; description?: string; disabled?: boolean }[]` | – | Rows in order, each with optional secondary copy. |
| `value` | `string` | – | Selected value. Controlled. |
| `defaultValue` | `string` | – | Initial value when uncontrolled. |
| `onValueChange` | `(value: string) => void` | – | Called with the chosen value. |
| `disabled` | `boolean` | `false` | Disables every option. |
| `className` | `string` | – | Added to the fieldset. |
| `name` | `string` | – | Native radio name for form submission. Generated when omitted. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Arrow keys | Move the selection between options (native radio behavior). |
| Tab | Enters and leaves the group at the selected option. |

## Accessibility


- Uses a fieldset and legend with native radio inputs wrapped in labels.
- The highlight and dot are aria-hidden decoration.

## Motion


- One highlight glides to the chosen row on the morph spring while the new dot springs in and the old one shrinks away.
- Reduced motion places the highlight and dot instantly; resizes never animate.

## Responsive behavior


- Rows stack vertically and stretch to the column, so long descriptions wrap cleanly on narrow screens.
- A ResizeObserver re-places the highlight on resize without animating it.

## Performance


- One shared highlight moves between rows instead of a layout animation per row.

## Notes


- Use for two to six mutually exclusive options that need descriptions. Use segmented-control for short inline choices and select for longer lists.
- Always controlled: value and onValueChange are required. Pass name to submit with a form.

## Related

- [Select](/components/select): A compact choice field with a keyboard friendly menu.
- [Checkbox](/components/checkbox): A binary choice with a precise, legible state.
