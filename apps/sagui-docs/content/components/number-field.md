---
title: Number field
slug: number-field
description: "Enter a bounded number with clear increment controls."
category: special-inputs
component: NumberField
keywords:
  - field
  - numeric
  - react number input
  - number field
  - stepper input
  - quantity selector
  - numeric input with buttons
  - scrub input
  - odometer number input
---

Enter a bounded number with clear increment controls.

<!-- demo: Hero -->

## When to use


- Bounded quantities like seats, items, or prices where the exact number matters.
- Values people nudge with steppers, arrow keys, or by dragging the label with scrub.
- Numbers with units, using a prefix or a pluralizing suffix function.

## When not to use


- Use slider when the approximate position matters more than the exact number.
- Use input for numeric strings like phone numbers or codes.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { NumberField } from "@sagui/ui";

export function SeatsField() {
  const [seats, setSeats] = useState(5);
  return (
    <NumberField
      label="Seats"
      value={seats}
      onValueChange={setSeats}
      min={1}
      max={500}
      suffix={(n) => (n === 1 ? " seat" : " seats")}
      scrub
    />
  );
}
```

## Examples

### Prefix and step

<!-- demo: Currency -->

### Decimals

Fraction digits follow the precision of `step`.

<!-- demo: Decimals -->

### Sizes

<!-- demo: Sizes -->

### Disabled

<!-- demo: Disabled -->


## API reference


### NumberField

A numeric spinbutton with stepper buttons, rolling digits, hold-to-repeat, and optional label scrubbing.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Visible label; also names the stepper buttons. |
| `value` | `number` | – | Controlled value. |
| `defaultValue` | `number` | `0` | Initial value when uncontrolled. |
| `onValueChange` | `(value: number) => void` | – | Called on every committed step, scrub, or valid typed draft. |
| `min` | `number` | `0` | Lower bound. |
| `max` | `number` | `Number.MAX_SAFE_INTEGER` | Upper bound. |
| `step` | `number` | `1` | Increment; its precision also sets default fraction digits. |
| `largeStep` | `number` | `step * 10` | Distance for PageUp, PageDown, and Shift with an arrow. |
| `description` | `string` | – | Helper copy under the field. |
| `disabled` | `boolean` | – | Disables the input and buttons. |
| `id` | `string` | – | Input id. Generated when omitted. |
| `prefix` | `string \| ((value: number) => string)` | – | Text before the number, such as "$". |
| `suffix` | `string \| ((value: number) => string)` | – | Text after the number; a function can pluralize, e.g. n => n === 1 ? " seat" : " seats". |
| `scrub` | `boolean` | `false` | Drag the label sideways to change the value. |
| `locale` | `string` | `"en-US"` | Formatting locale, fixed so server and client match. |
| `formatOptions` | `{ minimumFractionDigits?: number; maximumFractionDigits?: number; useGrouping?: boolean }` | – | Fraction digits and grouping. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height, type size, and default width (164, 196, or 228px). |
| `limitHint` | `boolean \| ((edge: "min" \| "max", limit: number) => string)` | `true` | Note beside the label when a press meets a limit (about 1.5s) or a typed value passes one. Defaults to "Max 10 seats" using the prefix and suffix; false hides it. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| ArrowUp / ArrowDown | Steps by step; holding repeats and speeds up, and keeps pushing at a limit. |
| Shift + Arrow / PageUp / PageDown | Steps by largeStep. |
| Home / End | Jumps to min or max when not typing. |
| Enter | Commits a typed draft, clamped to min and max, or selects the value. |
| Escape | Reverts a typed draft to the value before editing. |

## Accessibility


- The input has role="spinbutton" with aria-valuenow, aria-valuemin, aria-valuemax, and aria-valuetext including prefix and suffix.
- Stepper buttons are labelled "Increase <label>" and "Decrease <label>" and marked aria-disabled at a limit.
- Changes are announced through a polite aria-live region, and a clamp says which limit it met ("10 seats, maximum"); rolling digits are aria-hidden.
- A typed value past a limit sets aria-invalid and adds the limit note to aria-describedby until it commits. The warning also uses copy, never color alone.
- Focus darkens the shell border and adds a soft ring; a focused stepper button takes its hover fill and an inset ring.

## Motion


- Digits roll on wheels in the direction of change (up rolls up, down rolls down) with tabular numerals, and affixes reword in place.
- Holding a stepper repeats after 400ms and ramps from 150ms to 40ms per step.
- At a limit the value strains a few pixels toward the press and springs home; pushes in a row strain a little further, capped like overscroll. The refused button shakes once and the limit note rises in beside the label.
- A typed value past a limit tints the shell with the warning role; on Enter or blur it springs back to the limit with a digit roll.
- Reduced motion changes the value at once and answers a press at a limit with a brief warning tint on the number instead of the strain and shake.

## Responsive behavior


- The control is min(100%, 196px) wide at md (164px at sm, 228px at lg), overridable with --number-field-width. The label row, with its limit note, follows the same width.
- Stepper buttons are 26, 32, or 40px by size with touch-action manipulation, so fast taps do not zoom.
- Scrubbing the label uses pointer capture with touch-action pan-y, so vertical scrolling still works on touch.

## Performance


- Holding a stepper repeats on timeouts that speed up, not a per-frame loop.
- Two ResizeObservers handle digit layout and the helper row; fine for forms, not for large grids.

## Notes


- Use for bounded integers or decimals like quantities, seats, and prices. Use slider when the approximate position matters more than the exact number.
- Controlled with value and onValueChange or uncontrolled with defaultValue. There is no name prop; add a hidden input for plain forms.
- Set min below zero to allow negatives; the input then accepts a minus sign.
- The limit note sits at the end of the label row, so keep labels short enough to share the control's width with it, or set limitHint={false}.

## Related

- [Input](/components/input): A single line field with clear labels and useful states.
