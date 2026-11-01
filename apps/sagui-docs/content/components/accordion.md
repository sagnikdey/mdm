---
title: Accordion
slug: accordion
description: "Progressively reveal supporting information in place."
category: disclosure
component: Accordion
keywords:
  - disclosure
  - layout
  - react accordion
  - faq accordion
  - collapsible sections
  - animated accordion
  - radix accordion
  - expand collapse list
  - faq component
---

Progressively reveal supporting information in place.

<!-- demo: Hero -->

## When to use


- FAQ sections where only one answer should be open at a time.
- Settings or help pages that group long content under short, scannable questions.
- Page-level FAQs that need larger type, via size="lg".

## When not to use


- Use expandable-card for a single standalone disclosure such as a plan or order summary.
- Use tabs when sections are peer views that people switch between.
- Use onboarding-checklist when the rows are setup tasks to complete.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Accordion } from "@sagui/ui";

export function Faq() {
  return (
    <Accordion
      size="lg"
      items={[
        { title: "Can I cancel anytime?", content: "Yes. Your plan stays active until the period ends." },
        { title: "Do you offer refunds?", content: "Within 14 days of purchase, no questions asked." },
      ]}
    />
  );
}
```

## Examples

### Large

`size="lg"` sets questions larger and caps answers at 62ch, for page-level FAQs.

<!-- demo: Large -->

### All closed

Pass `defaultOpen={-1}` to start with every row collapsed.

<!-- demo: AllClosed -->

### Rich content

Answers are any `ReactNode`.

<!-- demo: RichContent -->


## API reference


### Accordion

A single-open, collapsible list of question and answer rows built on Radix Accordion.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` (required) | `{ title: string; content: ReactNode }[]` | – | Rows in order. The title is the trigger label; content fills the panel. |
| `defaultOpen` | `number` | `0` | Index of the row open on first render. Pass -1 to start with every row closed. |
| `size` | `"md" \| "lg"` | `"md"` | "lg" sets questions at the large text size for page-level FAQs. |
| `className` | `string` | – | Class for the accordion root. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / Space | Toggles the focused row. |
| ArrowDown / ArrowUp | Moves focus between row triggers. |
| Home / End | Jumps to the first or last trigger. |

## Accessibility


- Radix wires aria-expanded, aria-controls, and region labelling between each trigger and panel.
- Closed panels stay mounted but switch to visibility hidden once collapsed, so they leave the accessibility tree.
- Triggers sit inside heading elements; the chevron is aria-hidden.

## Motion


- Panel height springs without overshoot while the answer slides down 6px out of a subtle blur; the chevron rotates on a snappy spring.
- A toggle mid-flight retargets from the current height instead of restarting.
- Reduced motion applies the same end states in one step.

## Responsive behavior


- Rows fill their container width; the lg size caps answers at 62ch for readable line length.
- Below the sm breakpoint the lg size drops to a 68px row and smaller answer text with tighter right padding.
- Hover color changes apply only on hover-capable fine pointers.

## Performance


- Closed panels stay mounted and hidden, so every answer is in the DOM; keep very heavy content lazy inside the panel.
- Height springs through motion on the one row that changes, with no layout observers.

## Notes


- Use for FAQs and settings groups where only one section should be open. Use expandable-card for a single standalone disclosure and tabs when sections are peers.
- Content is plain data; pass rich ReactNode answers directly. Only single mode is supported.

## Related

- [Tabs](/components/tabs): Switch between related content in the same context.
