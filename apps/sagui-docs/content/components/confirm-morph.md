---
title: Confirm morph
slug: confirm-morph
description: "A destructive button that morphs into an inline confirmation, a spinner, and a result with undo."
category: buttons
component: ConfirmMorph
keywords:
  - actions
  - new
  - react confirm button
  - inline confirmation
  - delete confirmation button
  - confirm delete without modal
  - undo button
  - two step button
  - destructive action button
---

A destructive button that morphs into an inline confirmation, a spinner, and a result with undo.

<!-- demo: Hero -->

## When to use


- Deleting a selection in a table or file list, right where the button sits.
- Revoking access, removing a member, or discarding a draft.
- Actions that should offer Undo in place after they finish.

## When not to use


- Use dialog when the consequence needs more than one line, or when typing a name to confirm is required.
- Use action-button for safe async actions that need no question.
- Use hold-to-confirm when an accidental tap must be nearly impossible.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Trash2 } from "lucide-react";
import { ConfirmMorph } from "@sagui/ui";

export function DeleteSelection({ ids }: { ids: string[] }) {
  return (
    <ConfirmMorph
      label="Delete"
      icon={<Trash2 size={16} strokeWidth={1.75} />}
      prompt={`Delete ${ids.length} files?`}
      onConfirm={() => deleteFiles(ids)}
      onUndo={() => restoreFiles(ids)}
    />
  );
}
```

## Examples

### Neutral

Use the neutral tone for important actions that are not destructive.

<!-- demo: Neutral -->

### A failed action

Rejecting `onConfirm` shows the error face with Retry.

<!-- demo: FailsThenRetries -->

### Disabled

<!-- demo: Disabled -->


## API reference


### ConfirmMorph

A button for destructive or important actions that morphs into an inline question, then a spinner, then a result with Undo.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `ReactNode` | – | The resting label, such as "Delete". |
| `icon` | `ReactNode` | – | A plain icon before the resting label. |
| `prompt` | `ReactNode` | – | The question while confirming, such as "Delete 3 files?". Defaults to the label with a question mark. |
| `confirmLabel` | `string` | `"Delete"` | Confirm button label. |
| `cancelLabel` | `string` | `"Cancel"` | Cancel button label. |
| `pendingLabel` | `string` | `"Deleting"` | Shown beside the spinner while onConfirm resolves. |
| `doneLabel` | `string` | `"Deleted"` | Result label. |
| `errorLabel` | `string` | `"Couldn’t finish"` | Error label. |
| `retryLabel` | `string` | `"Retry"` | Retry button label on the error face. |
| `undoLabel` | `string` | `"Undo"` | Undo button label. |
| `undoingLabel` | `string` | `"Restoring"` | Shown beside the spinner while onUndo resolves. |
| `tone` | `"danger" \| "neutral"` | `"danger"` | danger colours the resting label and confirm button red; neutral uses the foreground. |
| `onConfirm` | `() => void \| Promise<unknown>` | – | Runs on confirm. Return a promise to show the pending face; a rejection shows the error face with Retry. |
| `onUndo` | `() => void \| Promise<unknown>` | – | Adds Undo to the result. Return a promise to show a pending face while it runs. |
| `onCancel` | `() => void` | – | Called when the question is cancelled, including by Escape, outside press, or timeout. |
| `state` | `"idle" \| "confirming" \| "pending" \| "done" \| "error"` | – | Controlled state. Pair it with onStateChange. |
| `defaultState` | `"idle" \| "confirming" \| "pending" \| "done" \| "error"` | `"idle"` | Starting state when uncontrolled. |
| `onStateChange` | `(state: ConfirmMorphState) => void` | – | Called on every state change. |
| `confirmTimeout` | `number` | `6000` | Milliseconds before an unanswered question returns to rest. Hovering pauses it; 0 turns it off. |
| `resultTimeout` | `number` | `5000` | Milliseconds a result stays before returning to rest. Hovering pauses it; 0 turns it off. |
| `cancelOnOutsidePress` | `boolean` | `true` | A press outside the control cancels an open question. |
| `disabled` | `boolean` | `false` | Disables the resting button. |
| `className` | `string` | – | Class on the root. |
| `ref` | `Ref<HTMLDivElement>` | – | The root element, which also takes focus while the action is pending. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / Space | Presses the focused face button: start, Cancel, Confirm, Undo, or Retry. |
| Tab / Shift+Tab | Moves between Cancel and Confirm while asking. |
| Escape | Cancels the question, or dismisses a result back to rest. |

## Accessibility


- The question face is a group labelled by the prompt, and Cancel takes focus first so Enter never confirms by accident.
- Focus follows the morph: each new face focuses its main button, and the root holds focus while pending with aria-busy.
- Prompts, pending labels, results, and "Undo is available" are announced through a polite live region.
- Timeouts pause while the pointer rests on the control and while the tab is hidden.

## Motion


- The surface width springs to each face (a bouncier spring when growing, a critically damped one when shrinking), so nothing around it jumps.
- Faces slide in from the right going forward and from the left going back, with a soft blur; the done check draws itself.
- A thin bar drains along the bottom edge for the timeout.
- Reduced motion removes the width spring, slide, blur, and draw; faces crossfade and the spinner slows.

## Responsive behavior


- The control is as wide as its current face; leave room beside it for the question face, which is wider than the resting button.
- Hover styles apply only on hover-capable fine pointers; the control keeps the small control height, so give Cancel and Confirm some space from nearby targets on touch layouts.

## Performance


- Only the current face and the one leaving render; a ResizeObserver per face measures width for the spring.
- The timeout is a single linear motion value animation that pauses and resumes, not a timer per frame.

## Notes


- Use for destructive or important actions that deserve a second press but not a modal: delete, revoke, discard.
- Return the real promise from onConfirm; rejections show the error face with Retry, which reruns the same handler.
- Offer onUndo when the action can be reversed; then consider a short confirmTimeout or skipping the question in your own flow.
- Use hold-to-confirm when a deliberate press and hold fits better, and dialog when the consequence needs a full explanation.

## Related

- [Action button](/components/action-button): A compact button for frequent toolbar actions.
