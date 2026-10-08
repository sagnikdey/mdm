---
title: Approval card
slug: approval-card
description: "Human-in-the-loop questions an agent asks before it acts."
category: cards
component: ApprovalCard
keywords:
  - new
  - ai
  - agent
  - human in the loop
  - approval
  - questionnaire
  - multi step question card
  - clarifying questions
---

Human-in-the-loop questions an agent asks before it acts.

<!-- demo: Hero -->

## When to use

- An agent needs a decision or clarification before it continues, such as a launch plan or a refund.
- A short run of related questions, answered one at a time, with a way to write your own answer.

## When not to use

- Use dialog for long forms or anything with validation across fields.
- Use confirm-morph for a single yes or no on a destructive action.
- Use radio-group or checkbox inside a form the person fills out on their own.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage

```tsx
import { ApprovalCard } from "@sagui/ui";

export function LaunchQuestions() {
  return (
    <ApprovalCard
      questions={[
        { id: "flavors", question: "How many flavors should we launch?", options: [{ value: "three", label: "Three (core line)" }, { value: "five", label: "Five (full case)" }] },
        { id: "mixins", question: "Which mix-ins should we stock?", type: "multiple", options: [{ value: "chocolate", label: "Chocolate chips" }, { value: "sprinkles", label: "Sprinkles" }] },
      ]}
      onSubmit={async (answers) => { await sendToAgent(answers); }}
      onDismiss={() => {}}
    />
  );
}
```

`answers` maps each question id to `{ values, other }`, or `null` when it was skipped.

## Examples

### Single question

With one question the stepper hides, and the action reads `submitLabel`. `allowOther: false` removes the free text row.

<!-- demo: SingleQuestion -->

## API reference

### ApprovalCard

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `questions` (required) | `{ id: string; question: string; options: { value: string; label: string }[]; type?: "single" \| "multiple"; allowOther?: boolean; otherPlaceholder?: string }[]` | – | The questions, asked in order. |
| `onSubmit` | `(answers: ApprovalAnswers) => void \| Promise<unknown>` | – | Runs after the last question. A promise holds Send in its loading state; a rejection returns to the card. |
| `onDismiss` | `() => void` | – | Shows the close button. |
| `showResult` | `boolean` | `true` | After sending, shows an "Answers sent" pill with Start over. |
| `autoAdvance` | `boolean` | `true` | Single choice questions move on as soon as an option is picked. |
| `continueLabel` | `string` | `"Continue"` | Action label before the last question. |
| `submitLabel` | `string` | `"Send"` | Action label on the last question. |
| `skipLabel` | `string` | `"Skip"` | Records the question as skipped. |
| `sentLabel` / `resetLabel` | `string` | `"Answers sent"` / `"Start over"` | Result pill text. |

## Keyboard interactions

| Keys | Action |
| --- | --- |
| 1–9 | Picks that option. |
| ArrowUp / ArrowDown | Moves between options and the free text row. |
| Space | Picks or toggles the focused option. |
| Enter in the free text row | Continues, or sends on the last question. |
| Tab | Moves to the stepper, Skip and Continue. |

## Accessibility

- Each question is a labelled radiogroup or group of native radios or checkboxes.
- The stepper buttons are labelled "Previous question" and "Next question"; the position is announced politely.
- When a question changes, focus moves to its first option if it was inside the card.
- The result pill is a status region.

## Motion

- Questions crossfade with a short rise and blur in the direction of travel, and the card eases to the new height.
- The radio dot and check mark spring in; the result pill scales in with the check.
- Reduced motion swaps questions with a plain fade.

## Notes

- Next is available only up to the furthest question reached, so people can revisit answers without jumping ahead.
- In single choice, typing your own answer clears the picked option.

## Related

- [Radio group](/components/radio-group): A single choice from a short list.
- [Confirm morph](/components/confirm-morph): Asks in place before a destructive action.
- [Dialog](/components/dialog): A focused task in a modal.
