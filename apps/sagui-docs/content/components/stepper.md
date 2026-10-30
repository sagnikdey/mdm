---
title: Stepper
slug: stepper
description: "Show progress through a linear, multi-step flow."
category: navigation
component: Stepper
keywords:
  - navigation
  - stepper
  - wizard
  - onboarding
  - progress steps
---

Show progress through a linear, multi-step flow.

<!-- demo: Hero -->

## When to use

- A linear flow of 3 to 10 steps where people need to see where they are, such as onboarding or setup.
- The left rail of a wizard page, beside the current step's form card.

## When not to use

- Use tabs for peer views people switch between freely.
- Use breadcrumb for page hierarchy, and app-shell for app navigation.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage

```tsx
import { Stepper } from "@sagui/ui";

export function OnboardingRail() {
  return <Stepper current={1} steps={[{ label: "Company profile" }, { label: "Contacts" }, { label: "Banking" }]} />;
}
```

Steps before `current` show a check and later ones show an outlined number. The caption ("Step 2 of 3") follows `current`. Keep labels to short nouns.

## Examples

### Step with an error

Set `error` on a step only when it has fields to fix.

<!-- demo: WithError -->

## Accessibility

- Renders a `nav` with an ordered list, and the current step has `aria-current="step"`.
- Completed and error steps include hidden text, so their state doesn't rely on color.
- Pass `aria-label` when a page has more than one stepper.
