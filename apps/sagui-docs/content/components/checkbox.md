---
title: Checkbox
slug: checkbox
description: "A binary choice with a precise, legible state."
category: selection
component: Checkbox
keywords:
  - field
  - form
  - react checkbox
  - animated checkbox
  - indeterminate checkbox
  - radix checkbox
  - checkbox with description
  - terms checkbox
---

A binary choice with a precise, legible state.

<!-- demo: Hero -->

## When to use


- Independent on and off choices confirmed by a submit, such as accepting terms.
- Parent rows that show a partial selection through the indeterminate state.

## When not to use


- Use switch for settings that apply immediately.
- Use radio-group when only one option can be chosen.
- Use chip-group for filter facets people toggle often.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Checkbox } from "@sagui/ui";

export function TermsCheckbox() {
  const [accepted, setAccepted] = useState(false);
  return (
    <Checkbox
      label="I agree to the terms"
      description="You can export your data at any time."
      checked={accepted}
      onCheckedChange={(next) => setAccepted(next === true)}
    />
  );
}
```

## Examples

### Already checked

<!-- demo: Checked -->

### Select all, with an indeterminate state

A parent checkbox shows `"indeterminate"` when only some children are on. The check morphs into the dash instead of swapping.

<!-- demo: SelectAll -->

### Disabled

<!-- demo: Disabled -->


## API reference


### Checkbox

A Radix checkbox whose check morphs into the indeterminate dash and back.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | – | Visible label. Without it, pass aria-label; the fallback name is "Checkbox". |
| `description` | `string` | – | Secondary copy under the label, linked through aria-describedby. |
| `checked` | `boolean \| "indeterminate"` | – | Controlled state. |
| `defaultChecked` | `boolean \| "indeterminate"` | `false` | Initial state when uncontrolled. |
| `onCheckedChange` | `(checked: boolean \| "indeterminate") => void` | – | Called on every toggle. |
| `...props` | `ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>` | – | Radix Checkbox root props, including ref, name, value, required, and disabled. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Space | Toggles the checkbox. |

## Accessibility


- Radix renders a button with role="checkbox" and aria-checked, including "mixed" for indeterminate.
- The label is a real label element tied by id; description is linked through aria-describedby.
- The drawn mark is aria-hidden.

## Motion


- The fill scales in on a snappy spring while the check path draws; switching to indeterminate morphs the same path into a dash.
- Reduced motion applies every state change instantly.

## Responsive behavior


- The hit box is a full control-height square, so it stays easy to tap even though the drawn box is smaller.
- The label and description wrap beside the box; the box stays top-aligned with the first line.

## Performance


- A single spring on the fill and a path draw per toggle; long lists of checkboxes are fine.

## Notes


- Use for independent on/off choices in forms. Use switch for settings that apply immediately and chip-group for filter facets.
- Set checked="indeterminate" on a parent checkbox when only some children are selected.
- Radix renders a hidden native input when name is set, so it submits with forms.

## Related

- [Radio group](/components/radio-group): Choose one option from a visible set.
