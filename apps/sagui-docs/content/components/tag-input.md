---
title: Tag input
slug: tag-input
description: "Turn short text values into removable tags."
category: special-inputs
component: TagInput
keywords:
  - field
  - tags
  - react tag input
  - tags input
  - chip input
  - multi value input
  - email chips input
  - keyword input
---

Turn short text values into removable tags.

<!-- demo: Hero -->

## When to use


- Free-form lists of short values like tags, keywords, or emails.
- Fields where people add values by pressing Enter or comma.

## When not to use


- Use multi-select or chip-group when values come from a fixed list.
- Use input for a single value.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { TagInput } from "@sagui/ui";

export function TopicsField() {
  const [topics, setTopics] = useState(["design", "motion"]);
  return (
    <TagInput
      label="Topics"
      value={topics}
      onValueChange={setTopics}
      description="Press Enter or comma to add."
    />
  );
}
```

## Examples

### Empty

<!-- demo: Empty -->

### Controlled

Tags are plain strings. Normalize or validate in `onValueChange`.

<!-- demo: Controlled -->

### Many tags

The field grows with its wrapped rows on a spring.

<!-- demo: ManyTags -->


## API reference


### TagInput

A field that turns typed text into removable tags, with keyboard picking and a gliding selection ring.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Visible label tied to the text input. |
| `value` | `string[]` | – | Controlled tags. |
| `defaultValue` | `string[]` | `[]` | Initial tags when uncontrolled. |
| `onValueChange` | `(value: string[]) => void` | – | Called with the full list after each add or remove. |
| `placeholder` | `string` | `"Add a tag"` | Shown while there are no tags. |
| `description` | `string` | – | Helper copy under the field. |
| `error` | `string` | – | Error copy. Colors the border, sets aria-invalid, and is announced as an alert. |
| `className` | `string` | – | Added to the root. |
| `id` | `string` | – | Input id. Generated when omitted. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / , | Adds the typed text as a tag. Duplicates (case-insensitive) pulse the existing tag instead. |
| Backspace | At the start of the input, picks the last tag; pressed again, removes the picked tag. |
| Delete | Removes the picked tag. |
| ArrowLeft / ArrowRight | Moves the pick between tags and back to the input. |
| Escape | Clears the pick. |

## Accessibility


- Each tag has a remove button labelled "Remove <tag>".
- Adds, removals, picks, and duplicates are announced in a polite aria-live region.
- Blurring the input commits any typed draft as a tag.

## Motion


- New tags blur and scale in where the text was typed; removed tags leave and the rest glide on the morph spring. The shell follows wrapped rows on a smooth spring.
- A ring glides between picked tags. Reduced motion removes layout travel, scale, and blur, keeping fades.

## Responsive behavior


- Tags wrap onto new rows and the shell height follows on a spring, so the field never scrolls horizontally.
- The text input keeps an 80px minimum, dropping to its own row when the last row is full.

## Performance


- Every tag is a motion element with layout position animation; fine for dozens of tags, not hundreds.
- Two ResizeObservers track the content and message heights.

## Notes


- Use for free-form values like tags, emails, or keywords. Use multi-select or chip-group when values come from a fixed list.
- Controlled or uncontrolled. Tags are plain strings; validate or normalize in onValueChange.

## Related

- [Input](/components/input): A single line field with clear labels and useful states.
