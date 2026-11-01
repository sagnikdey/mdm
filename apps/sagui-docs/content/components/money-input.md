---
title: Money input
slug: money-input
description: "A currency field with live grouping, stable width, rolling digits, and minor-unit output."
category: special-inputs
component: MoneyInput
keywords:
  - inputs
  - new
  - react money input
  - currency input
  - amount field
  - price input
  - cents input
  - currency selector
  - formatted number input
  - payment amount
---

A currency field with live grouping, stable width, rolling digits, and minor-unit output.

<!-- demo: Hero -->

## When to use


- Payment, tip, transfer, or budget amounts entered by hand.
- Invoice and expense forms where the currency may change.
- Amount fields that benefit from quick add chips such as +$10.

## When not to use


- Use number-field for quantities and non currency numbers.
- Use slider or price-ladder when people pick from a range rather than type.
- Use scrub-input for design tool style drag adjustments.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { useState } from "react";
import { MoneyInput } from "@sagui/ui";

export function TipAmount() {
  const [cents, setCents] = useState<number | null>(1500);
  return (
    <MoneyInput
      label="Amount"
      name="amount"
      value={cents}
      onValueChange={setCents}
      currencies={["USD"]}
      min={100}
      max={100_000}
      quickAdd={[5, 10, 20]}
    />
  );
}
```

## Examples

### Reading the value

The value comes out in minor units, so $12.50 is 1250.

<!-- demo: MinorUnits -->

### Limits

Typing past `max` is refused with a nudge. A value under `min` is reported when the field loses focus.

<!-- demo: WithLimits -->

### Other currencies and locales

Grouping, the decimal mark and the symbol position follow the locale and currency.

<!-- demo: Euro -->

Currencies without minor units, such as yen, have no cents.

<!-- demo: Yen -->


## API reference


### MoneyInput

A currency amount field that groups digits as you type, holds missing cents as ghosts, scales long amounts to fit, and returns minor units.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Field label. |
| `hideLabel` | `boolean` | `false` | Keeps the label for screen readers only. |
| `value` | `number \| null` | – | Controlled amount in minor units (cents for USD, yen for JPY). null is empty. |
| `defaultValue` | `number \| null` | `null` | Starting amount in minor units when uncontrolled. |
| `onValueChange` | `(value: number \| null, details: MoneyInputDetails) => void` | – | Called with minor units and { currency, major, formatted }. |
| `currency` | `string` | – | Controlled ISO 4217 code, such as "USD". |
| `defaultCurrency` | `string` | `"USD"` | Starting currency when uncontrolled. |
| `onCurrencyChange` | `(currency: string) => void` | – | Called when a currency is picked. The major amount carries over. |
| `currencies` | `string[]` | `["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "INR"]` | Codes in the currency menu. Pass one code to hide the menu. |
| `min` | `number` | – | Lowest amount in minor units. Checked when the field loses focus. |
| `max` | `number` | – | Highest amount in minor units. Typing past it is refused with a nudge. |
| `quickAdd` | `number[]` | `[10, 50, 100]` | Quick add chips in major units. Pass an empty array to hide them. |
| `step` | `number` | – | Arrow keys move by this many minor units. Defaults to one major unit; Shift moves ten times as far. |
| `locale` | `string` | `"en-US"` | Formatting locale. Fixed by default so server and client render the same digits. |
| `description` | `string` | – | Hint under the field. |
| `error` | `string` | – | Replaces the built-in range message. |
| `disabled` | `boolean` | `false` | Disables the field, menu, and chips. |
| `name` | `string` | – | Adds a hidden input carrying the amount in minor units. |
| `id` | `string` | – | Id of the input. |
| `className` | `string` | – | Class on the root. |
| `onBlur` | `(event: FocusEvent<HTMLInputElement>) => void` | – | Called when the input loses focus, after the fraction settles. |
| `ref` | `Ref<HTMLInputElement>` | – | Forwarded to the input. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| ArrowUp / ArrowDown | Adds or subtracts one step (one major unit by default). |
| Shift+ArrowUp / Shift+ArrowDown | Moves ten steps. |
| PageUp / PageDown | Moves ten steps. |
| Enter | Settles the fraction, such as 12.5 to 12.50. |
| Backspace / Delete | Over a group separator, deletes the digit beside it. |
| ArrowDown / ArrowUp (on the currency button) | Opens the currency menu. |
| ArrowDown / ArrowUp / Home / End (in the menu) | Moves through currencies; typing jumps by code or name. |
| Enter / Space (in the menu) | Picks the highlighted currency. |
| Escape (in the menu) | Closes the menu and returns to the button. |

## Accessibility


- The input has role="spinbutton" with aria-valuenow in major units, aria-valuetext as the full currency string, and min and max when set.
- The animated digits are aria-hidden; the real input carries the value, so screen readers and autofill see plain text.
- The range, hint, and error are linked with aria-describedby; limits, chip adds, and currency changes are announced politely.
- The currency menu is a listbox with aria-activedescendant and typeahead.

## Motion


- Chips and arrow keys roll each digit column in the direction of change while new columns open their width; typing cuts straight to the result so the caret never lags.
- A refused change kicks the amount sideways on a bouncy spring and flashes the range.
- The currency symbol swaps with a short roll while its slot springs to the new width; long amounts scale down to fit on a spring.
- Reduced motion removes the rolls, kick, and width springs; digits fade and sizes jump.

## Responsive behavior


- Under 420px viewport width the amount text drops a size and the padding tightens.
- A ResizeObserver scales the amount down to fit its box instead of scrolling, so long numbers stay readable on phones.
- inputMode is decimal (numeric for zero decimal currencies like JPY), which brings up the number keypad on touch.

## Performance


- Intl.NumberFormat instances are cached per locale and currency.
- Each digit is its own animated column; amounts are capped at 12 integer digits, which keeps the column count small.

## Notes


- Store the value in minor units (integers) to avoid floating point errors; details.major and details.formatted are for display.
- Use for money only. For plain numbers with units use number-field, and for drag-to-adjust values use scrub-input.
- Pass one code in currencies to lock the currency; the code then shows as static text.
- max refuses typing past it; min is only checked on blur, so people can type through smaller amounts on the way.

## Related

- [Number field](/components/number-field): Enter a bounded number with clear increment controls.
- [Input](/components/input): A single line field with clear labels and useful states.
