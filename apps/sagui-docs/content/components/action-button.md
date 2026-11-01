---
title: Action button
slug: action-button
description: "A compact button for frequent toolbar actions."
category: buttons
component: ActionButton
keywords:
  - action
  - toolbar
  - react action button
  - async button
  - submit button with success state
  - save button animation
  - loading to success button
  - cta button with arrow
  - publish button
---

A compact button for frequent toolbar actions.

<!-- demo: Hero -->

## When to use


- A single async commit such as Save, Publish, or Submit where the result should appear on the button.
- Call-to-action buttons where a trailing arrow invites the next step.
- Flows where the button should reset to idle on its own after success, via resetAfterMs.

## When not to use


- Use button with loading for plain form submits that do not need a success state.
- Use action-swap when the control toggles between lasting states.
- Use hold-to-confirm when the action is destructive and needs a deliberate press.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { ActionButton } from "@sagui/ui";

export function PublishButton() {
  return (
    <ActionButton
      label="Publish"
      pendingLabel="Publishing"
      successLabel="Published"
      onAction={publish}
      onActionError={error => toast.error(String(error))}
    />
  );
}
```

## Examples

### Custom labels

Every state has its own label. Keep pending and success labels close in length so the width spring stays small.

<!-- demo: Save -->

### Keep the success state

Set `resetAfterMs` to 0 when the result should stay on the button, such as a one-time submit.

<!-- demo: StaysOnSuccess -->

### Handling errors

If `onAction` rejects, the button returns to idle and calls `onActionError`. Show the message in a toast or inline; the button never keeps an error state of its own.

<!-- demo: WithError -->


## API reference


### ActionButton

A call-to-action button with a trailing arrow that runs an async action and morphs through pending and success.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Idle label and accessible name. |
| `onAction` (required) | `() => void \| Promise<void>` | – | Runs on press. The pending state lasts until the promise settles. |
| `pendingLabel` | `string` | `"Saving"` | Label while onAction runs. |
| `successLabel` | `string` | `"Saved"` | Label after onAction resolves. |
| `resetAfterMs` | `number` | `2400` | Delay before returning to idle after success. 0 keeps the success state. |
| `onActionError` | `(error: unknown) => void` | – | Called when onAction rejects; the button returns to idle. |
| `...props` | `ButtonHTMLAttributes<HTMLButtonElement>` | – | Forwarded to the button, except onClick. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / Space | Runs the action. |

## Accessibility


- Native button; the visible label is aria-hidden and a visually hidden copy of label names it.
- Pending sets aria-busy and aria-disabled instead of disabled, so keyboard focus stays through the save.
- A role="status" region announces the pending and success labels.

## Motion


- Changed letters rise from a soft blur while the width springs to fit; the arrow leaves forward and a check draws itself in.
- Presses scale to about 0.97 on a snappy spring.
- Reduced motion drops the press scale, width spring, and stroke draw, and swaps with an instant fade.

## Responsive behavior


- Width springs to fit pending and success labels, so keep them close in length inside tight toolbars.
- Hover shadow applies only on hover-capable fine pointers; touch gets the press scale.

## Performance


- Every letter is a motion span with layout position animation plus a small blur; fine for a few buttons, not for dense tables.
- A ResizeObserver drives the width spring.

## Notes


- Use for a single async commit (save, publish, submit) where the result should show on the button itself.
- Prefer button with loading for plain forms, and action-swap when the control toggles between lasting states.
- Return the real promise from onAction; handle errors in onActionError since the button just resets.

## Related

- [Button](/components/button): A clear, responsive action with quiet secondary states.
