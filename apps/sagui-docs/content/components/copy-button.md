---
title: Copy button
slug: copy-button
description: "Copy a value with immediate confirmation."
category: buttons
component: CopyButton
keywords:
  - action
  - utility
  - react copy button
  - copy to clipboard
  - copy button animation
  - clipboard button
  - copy code button
  - copied feedback
---

Copy a value with immediate confirmation.

<!-- demo: Hero -->

## When to use


- Next to API keys, install commands, links, or code snippets.
- Icon-only copy controls in dense rows, with an accessible label.
- Any copy action that should confirm Copied or Could not copy in place.

## When not to use


- Use split-button when copying has alternatives, such as Copy link and Copy as Markdown.
- Use code-block for full code samples, which include their own copy control.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { CopyButton } from "@sagui/ui";

export function ApiKeyRow({ apiKey }: { apiKey: string }) {
  return (
    <div className="row">
      <code>{apiKey}</code>
      <CopyButton value={apiKey} label="Copy key" iconOnly />
    </div>
  );
}
```

## Examples

### Plain

The plain variant has no border, for use inside a code block or a row of actions.

<!-- demo: Plain -->

### Icon only

<!-- demo: IconOnly -->

### Inside a code block

<!-- demo: InCodeBlock -->


## API reference


### CopyButton

Copies a string to the clipboard and morphs its icon and label to Copied or Failed.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` (required) | `string` | – | The text to copy. |
| `label` | `string` | `"Copy"` | Idle label and accessible name. |
| `iconOnly` | `boolean` | `false` | Hides the text and shows only the icon. |
| `variant` | `"outline" \| "plain"` | `"outline"` | Bordered or borderless. |
| `disabled` | `boolean` | – | Disables the button. |
| `onCopied` | `() => void` | – | Called after a successful copy. |
| `className` | `string` | – | Extra class on the button. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / Space | Copies the value. |

## Accessibility


- Native button named by label, including when iconOnly.
- A polite role="status" region announces "<label>: Copied" or "<label>: Could not copy".
- The label cell reserves the widest of its three states, so the layout never shifts.

## Motion


- Icons trade places through a blur on a slow, nearly critically damped spring, and the check draws its stroke in.
- Only the changed letters of the label move; the same motion plays in reverse on reset.
- Reduced motion swaps icon and text with an instant fade and skips the stroke draw.

## Responsive behavior


- The label reserves the width of its widest state, so the button never shifts its neighbours when it changes.
- It sizes to max-content with max-width 100%, so it stays compact in narrow rows.

## Performance


- Only changed letters animate; the icon swap and stroke draw are a single short spring per copy.
- Clipboard access is async and needs a secure context; failures show the Failed state rather than throwing.

## Notes


- Use next to any copyable value: API keys, install commands, links, code. For a copy action that also has alternatives use split-button.
- Named export only; there is no default export.
- Clipboard state and reset timing come from lib/use-copy-feedback, so copy that file along with the component.

## Related

- [Button](/components/button): A clear, responsive action with quiet secondary states.
- [Split button](/components/split-button): A primary action with a menu of nearby alternatives.
- [Action button](/components/action-button): A compact button for frequent toolbar actions.
