---
title: Phone input
slug: phone-input
description: "A phone field with a country picker, formatting as you type, and E.164 output."
category: special-inputs
component: PhoneInput
keywords:
  - inputs
  - new
  - react phone input
  - phone number field
  - country code picker
  - international phone input
  - e164 phone
  - phone number formatting
  - tel input with flag
---

A phone field with a country picker, formatting as you type, and E.164 output.

<!-- demo: Hero -->

## When to use


- Sign up, checkout, and contact forms that need a phone number in E.164.
- International audiences where the country and calling code must be clear.
- Two factor setup before sending an SMS code.

## When not to use


- Use input with type="tel" when you only store free text and never dial or text the number.
- Use otp-input for the verification code itself.
- Use a full metadata library if you need carrier or number type validation beyond length.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { useState } from "react";
import { PhoneInput } from "@sagui/ui";

export function ContactPhone() {
  const [phone, setPhone] = useState("");
  const [valid, setValid] = useState(false);
  return (
    <PhoneInput
      label="Phone number"
      name="phone"
      value={phone}
      onValueChange={(value, details) => { setPhone(value); setValid(details.valid); }}
      defaultCountry="GB"
      preferredCountries={["GB", "IE", "US"]}
      description={valid ? undefined : "We only text about your order"}
    />
  );
}
```

## Examples

### Reading the value

<!-- demo: E164 -->

### Prefilled

Pass an E.164 number and the field picks the country and formats the rest.

<!-- demo: Prefilled -->

### Limiting countries

<!-- demo: LimitedCountries -->


## API reference


### PhoneInput

A phone number field with a searchable country picker that grows out of the flag button, formatting as you type and returning E.164.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Field label. |
| `hideLabel` | `boolean` | `false` | Keeps the label for screen readers only. |
| `value` | `string` | – | Controlled number in E.164, such as "+14155550132". An empty string clears the field. |
| `defaultValue` | `string` | – | Starting number when uncontrolled. |
| `onValueChange` | `(value: string, details: PhoneInputDetails) => void` | – | Fires on every edit with the E.164 number (empty without digits) and { country, formatted, status, valid }. |
| `country` | `string` | – | Controlled ISO code of the selected country. |
| `defaultCountry` | `string` | `"US"` | ISO code used until someone picks a country or enters an international number. |
| `onCountryChange` | `(iso: string) => void` | – | Called when the country changes, including from a pasted number. |
| `countries` | `string[]` | – | Limit the picker to these ISO codes. |
| `preferredCountries` | `string[]` | `["US", "CA", "GB"]` | Pinned at the top of the picker under Suggested. |
| `description` | `string` | – | Hint under the field. |
| `error` | `string` | – | Replaces the built-in validation message. |
| `validate` | `boolean` | `true` | Show a message after blur when the number has the wrong length. |
| `disabled` | `boolean` | `false` | Disables the number and the picker. |
| `required` | `boolean` | – | Marks the number input required. |
| `name` | `string` | – | Adds a hidden input carrying the E.164 value for native form submission. |
| `id` | `string` | – | Id of the number input. |
| `className` | `string` | – | Class on the root. |
| `onBlur` | `(event: FocusEvent<HTMLInputElement>) => void` | – | Called when the number input loses focus. |
| `ref` | `Ref<HTMLInputElement>` | – | Forwarded to the number input. |

### parsePhoneNumber / formatPhoneNumber / formatNational

Helpers: parse "+44 (0)7911…" or "0044…" into { country, national }, format E.164 for display, or format national digits for a country.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `input` (required) | `string` | – | parsePhoneNumber(input, pool?) returns { country, national } or null. |
| `e164` (required) | `string` | – | formatPhoneNumber(e164) returns "+44 7400 123456", or the input when it can not be read. |
| `entry, digits` (required) | `PhoneCountry, string` | – | formatNational(entry, digits) formats national digits, keeping a typed trunk prefix. |

### PHONE_COUNTRIES / flagOf

The built-in table of 49 countries with calling codes, patterns, trunk prefixes, and examples, and a helper that turns an ISO code into a flag emoji.

No props.

## Keyboard interactions


| Keys | Action |
| --- | --- |
| + (in the number) | Opens the picker with a calling code search. |
| ArrowDown / ArrowUp (on the country button) | Opens the picker. |
| Any letter (on the country button) | Opens the picker searching for that letter. |
| ArrowDown / ArrowUp / PageDown / PageUp | Moves through countries while searching. |
| Home / End | First or last country when the search is empty. |
| Enter | Picks the highlighted country and returns to the number. |
| Escape | Closes the picker and returns to the country button. |
| Backspace / Delete | Over a separator, deletes the digit beside it. |

## Accessibility


- The search is a combobox with aria-activedescendant over a listbox of options grouped into Suggested and All countries.
- The country button reads "Country, <name> +<code>"; picks, pasted country changes, and result counts are announced politely.
- The number input is type="tel" with autocomplete="tel"; errors are linked with aria-describedby and shown with role="alert" after blur.
- A valid number is announced as "Valid <country> number" while a check appears.

## Motion


- One surface springs its width, height, and corner radius from the country button into the list, and back when closing.
- The flag and code roll in the direction of the list when the country changes; the highlight glides between rows.
- Messages open on a height spring with a small rise and blur; the valid check pops in.
- Reduced motion jumps the surface to size and replaces rolls, blurs, and glides with short fades.

## Responsive behavior


- The open list is as wide as the field up to 340px, measured with a ResizeObserver, so it fits phones without covering the page.
- The number input uses inputMode="tel" for the phone keypad; hover styles apply only on fine pointers.

## Performance


- The country table is about 50 entries inline, with no network request; search filters it on each keystroke.
- The morph animates width and height on one element; keep one picker open at a time.

## Notes


- Store the E.164 value; format it for display with formatPhoneNumber. details.valid tells you when the length matches the country.
- Validation checks length per country only; confirm ownership with an OTP step (otp-input) when it matters.
- Pasted or autofilled international numbers choose their own country, and +1 splits into Canada by area code.
- Restrict countries with countries and pin the likely ones with preferredCountries; the table ships inline with no metadata download.

## Related

- [Input](/components/input): A single line field with clear labels and useful states.
