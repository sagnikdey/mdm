---
title: Textarea
slug: textarea
description: "A multiline field for notes, descriptions, and longer text."
category: inputs
component: Textarea
keywords:
  - field
  - form
  - react textarea
  - multi-line input
  - textarea with character count
  - animated textarea
  - comment field
  - form textarea
---

A multiline field for notes, descriptions, and longer text.

<!-- demo: Hero -->

## When to use


- Free-form multi-line text like bios, comments, or feedback.
- Fields with a live character count, which rolls its digits in the helper row.

## When not to use


- Use input for single-line values.
- Use inline-edit with multiline for a description edited in place on a page.
- Use tag-input when the text is really a list of short values.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Textarea } from "@sagui/ui";

export function BioField() {
  const [bio, setBio] = useState("");
  return (
    <Textarea
      label="Bio"
      rows={4}
      value={bio}
      onChange={(event) => setBio(event.target.value)}
      description={`${280 - bio.length} characters left`}
    />
  );
}
```

## Examples

### Live count

<!-- demo: LiveCount -->

### With an error

<!-- demo: WithError -->


## API reference


### Textarea

A labelled multi-line field with the same animated helper and error rows as Input.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Visible label, tied to the textarea with htmlFor. |
| `description` | `string` | – | Helper copy under the field, linked through aria-describedby. Counts such as "120 characters" roll their digits. |
| `error` | `string` | – | Error copy. Sets aria-invalid and renders in a role="alert" row. |
| `...props` | `TextareaHTMLAttributes<HTMLTextAreaElement>` | – | Forwarded to the native textarea, including ref, rows, value, onChange, and maxLength. |

## Accessibility


- Native textarea with a real label.
- Description and error ids are merged into aria-describedby; errors set aria-invalid and use role="alert".
- Animated copy is aria-hidden and mirrored in a visually hidden plain-text span.

## Motion


- Message rows open their height on a smooth spring; changed words rise in with a soft blur and counts roll only the digits that changed.
- Reduced motion drops the roll, blur, and height spring for instant changes.

## Responsive behavior


- It fills its column with a 110px minimum height and a vertical resize handle; it does not auto-grow with content.
- Hover border styles apply only on hover-capable fine pointers.

## Performance


- One ResizeObserver per field measures the helper row for its height spring; cheap for a form, but avoid hundreds in a table.
- Recomputing a character count on each keystroke only re-renders the helper row words that changed.

## Notes


- Use for free-form, multi-line text. Use input for single lines and inline-edit for text edited in place on a page.
- A live character count in description gets the rolling-digit treatment for free.

## Related

- [Input](/components/input): A single line field with clear labels and useful states.
- [Inline edit](/components/inline-edit): Rename in place: the text becomes a field without moving.
- [Tag input](/components/tag-input): Turn short text values into removable tags.
