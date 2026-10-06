---
title: Button
slug: button
description: "A clear, responsive action with a loading state, icons, and a label that morphs in place."
category: buttons
component: Button
keywords:
  - button
  - cta
  - loading button
  - icon button
  - danger button
---

A clear, responsive action with a loading state, icons, and a label that morphs in place.

<!-- demo: Hero -->

## When to use

- Any action: submit a form, open a dialog, start a task.
- A primary action per view, with secondary, outline and ghost variants for quieter actions.
- Actions that finish asynchronously, using `loading`.

## When not to use

- Use a link for navigation. `asChild` lets a button take a link's element and keep its look.
- Use [action-button](/components/action-button) when a save should show its result on the button itself.
- Use [confirm-morph](/components/confirm-morph) when the action is destructive and needs a second press.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage

```tsx
import { Button } from "@sagui/ui";

export function SaveButton() {
  return <Button onClick={save}>Save changes</Button>;
}
```

## Examples

### Sizes

Heights are 32px, 40px and 48px. The icon size is a 40px square.

<!-- demo: Sizes -->

### Icons

Icons sit before or after the label. An icon-only button needs an `aria-label`, and logs a warning in development when it is missing.

<!-- demo: WithIcons -->

### Loading and label morph

`loading` shows a spinner, sets `aria-busy`, and blocks clicks while keyboard focus stays on the button. Change the children and the label crossfades while the width springs to fit.

<!-- demo: LabelMorph -->

### As a link

`asChild` renders the child element with the button's classes. Motion is off in this mode, since the child owns the element.

<!-- demo: AsLink -->

### Disabled

<!-- demo: Disabled -->

## API reference

### Button

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "secondary" \| "outline" \| "ghost" \| "danger"` | `"primary"` | Visual weight. Primary is the main action of a view. |
| `size` | `"sm" \| "md" \| "lg" \| "icon"` | `"md"` | 32, 40 or 48px tall; icon is a 40px square. |
| `loading` | `boolean` | `false` | Shows a spinner, sets aria-busy and aria-disabled, blocks clicks, and keeps keyboard focus. |
| `leadingIcon` | `ReactNode` | – | Icon before the label. Replaced by the spinner while loading. |
| `trailingIcon` | `ReactNode` | – | Icon after the label. |
| `asChild` | `boolean` | `false` | Render as the child element, such as a Next.js Link. No motion in this mode. |
| `...props` | `HTMLMotionProps<"button">` | – | Forwarded to the button, including ref, type, disabled, onClick and aria attributes. |

`buttonVariants` is also exported, for styling other elements like a button.

## Keyboard interactions

| Keys | Action |
| --- | --- |
| Enter / Space | Activates the button. |
| Tab / Shift + Tab | Moves focus in and out. A loading button stays in the tab order. |

## Accessibility

- A native button, or the child element with `asChild`, so roles and activation keys are native.
- Loading sets `aria-busy` and `aria-disabled` instead of `disabled`, so keyboard focus is not lost during a save.
- Icon-only buttons need an `aria-label`; icons are decorative and hidden from assistive technology.
- Focus draws a 2px ring with an offset, on every variant.

## Motion

- Presses scale to 0.97 (0.92 for icon-only) on a snappy spring.
- Changing the label crossfades with a soft blur while the width follows on a gentle spring.
- Reduced motion drops the press scale and the width spring and swaps the label with a short fade.

## Responsive behavior

- Buttons size to their content and never wrap their label. Set a width on the parent to stretch one.
- The 40px default meets common touch target guidance; use `lg` where touch matters most.

## Performance

- The label crossfade mounts one extra span per change; avoid driving it from a per-frame value.

## Notes

- Use one primary button per view. Pair it with an outline or ghost button for the secondary action.
- Prefer `loading` over disabling a button during a request, so the button keeps its place and focus.

## Related

- [Action button](/components/action-button): A button that shows pending and success on itself.
- [Split button](/components/split-button): A primary action with a menu of alternatives.
- [Confirm morph](/components/confirm-morph): A destructive button that confirms in place.
