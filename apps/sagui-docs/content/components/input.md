---
title: Input
slug: input
description: "A single line field with clear labels and useful states."
category: inputs
component: Input
keywords:
  - field
  - form
  - react input
  - text field
  - animated form input
  - input with error message
  - form field validation
  - labelled input
  - input helper text
---

A single line field with clear labels and useful states.

<!-- demo: Hero -->

## When to use


- Any single-line text value in a form, such as name, email, or URL.
- Fields whose helper or error copy changes as the person types, where the message should reword in place.
- Plain form posts, since it forwards name and every native input attribute.

## When not to use


- Use textarea for multi-line text.
- Use password-field, search-field, or number-field when the value has that shape.
- Use inline-edit for a value shown as page text and edited in place.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Input } from "@sagui/ui";

export function EmailField() {
  const [email, setEmail] = useState("");
  return (
    <Input
      label="Email"
      type="email"
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      description="We only use this for receipts."
      error={email && !email.includes("@") ? "Enter a valid email" : undefined}
    />
  );
}
```

## Examples

### Validation

Pass `error` when the value is invalid. The message opens its row on a spring, reads as an alert, and colors the border.

<!-- demo: Validation -->

### Live count

A count in the copy rolls only the digits that changed.

<!-- demo: LiveCount -->

### Disabled

<!-- demo: Disabled -->


## API reference


### Input

A labelled text input with helper and error copy that open on a spring and reword in place.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Visible label, tied to the input with htmlFor. |
| `description` | `string` | – | Helper copy under the field, linked through aria-describedby. |
| `error` | `string` | – | Error copy. Sets aria-invalid and renders in a role="alert" row. |
| `...props` | `InputHTMLAttributes<HTMLInputElement>` | – | Forwarded to the native input, including ref, type, value, onChange, and name. |

## Accessibility


- Renders a native input with a real label, so focus and form behavior are native.
- Description and error ids are merged into aria-describedby alongside any caller value.
- Errors set aria-invalid and announce through role="alert"; animated words are aria-hidden with a plain screen reader copy.

## Motion


- Helper and error rows open their height on a smooth spring, then changed words rise in and unblur while numbers roll digit by digit.
- Reduced motion mounts rows at full height and swaps words with an instant fade.

## Responsive behavior


- The field fills its grid column with min-width 0, so it shrinks inside narrow layouts without overflowing.
- Text stays at the small size on touch, unlike password-strength, so iOS may zoom on focus because the text is 14px.
- Hover border styles apply only on hover-capable fine pointers.

## Performance


- One ResizeObserver per field measures the helper row for its height spring; cheap for a form, but avoid hundreds in a table.
- Only changed words animate, and numbers roll only the digits that changed.

## Notes


- Default single-line text field. Use password-field, search-field, or number-field when the value has that shape.
- Works controlled or uncontrolled like a native input; pass name for plain form submission.
- Changing the error string rewords it in place, so derive it from state instead of toggling separate messages.

## Related

- [Textarea](/components/textarea): A multiline field for notes, descriptions, and longer text.
- [Password field](/components/password-field): Capture sensitive text with a visible reveal control.
- [Search field](/components/search-field): A recognizable search entry point with clear affordances.
- [Number field](/components/number-field): Enter a bounded number with clear increment controls.
