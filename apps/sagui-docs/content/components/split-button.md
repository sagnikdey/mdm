---
title: Split button
slug: split-button
description: "A primary action with a menu of nearby alternatives."
category: buttons
component: SplitButton
keywords:
  - action
  - menu
  - react split button
  - button with dropdown
  - split button menu
  - merge button
  - dropdown button
  - primary action with options
---

A primary action with a menu of nearby alternatives.

<!-- demo: Hero -->

## When to use


- One default action with a few close variants, like Merge with Squash and Rebase.
- Export or share actions where one format is the usual pick and others sit behind the chevron.
- Copy actions that swap the label to Copied in place while offering alternatives.

## When not to use


- Use dropdown-menu when there is no default action and every option is equal.
- Use button when there are no alternatives.
- Use context-menu for actions tied to a piece of content rather than a toolbar.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { SplitButton } from "@sagui/ui";

export function MergeButton() {
  return (
    <SplitButton
      label="Merge pull request"
      onClick={merge}
      actions={[
        { label: "Squash and merge", onSelect: squash },
        { label: "Rebase and merge", onSelect: rebase },
        { label: "Close pull request", onSelect: close, destructive: true },
      ]}
    />
  );
}
```

## Examples

### Secondary

The secondary variant sits on a neutral surface for toolbars, where a filled button would be too loud.

<!-- demo: Secondary -->

### Confirming in place

Change `label` and `icon` after the main action runs. The label morphs in place, the width follows on a spring, and the menu half never moves.

<!-- demo: CopyPage -->


## API reference


### SplitButton

A primary action joined to a chevron that opens a Radix dropdown of related actions.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Main action label. Changes morph letter by letter. |
| `actions` (required) | `SplitButtonAction[]` | – | Menu items: { label, onSelect?, disabled?, destructive?, icon? }. |
| `onClick` | `() => void` | – | Runs the main action. |
| `icon` | `ReactNode` | – | Leading icon on the main half. A different icon element crossfades in. |
| `variant` | `"primary" \| "secondary"` | `"primary"` | Visual weight of both halves. |
| `disabled` | `boolean` | – | Disables both the main action and the menu trigger. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / Space | Runs the main action, or opens the menu from the chevron. |
| ArrowDown / ArrowUp | Moves between menu items, looping at the ends. |
| Escape | Closes the menu and returns focus to the chevron. |

## Accessibility


- Two native buttons; the chevron is labelled "<label> more actions".
- The menu is a Radix DropdownMenu with menu and menuitem roles and focus management.
- The main label is announced through a polite live region when it changes.

## Motion


- The main label and icon morph in place while its width springs; the menu half never scales, so the menu opens from a still anchor.
- Menu items fade in with a short stagger.
- Reduced motion removes the press scale, width spring, and menu transform, leaving a quick opacity fade.

## Responsive behavior


- The menu opens aligned to the end of the button with 12px collision padding, so it stays on screen near viewport edges.
- The secondary variant sets a 142px minimum on the main half; the pair does not collapse on narrow screens, so give it its own row on mobile.

## Performance


- The main label animates per letter with a ResizeObserver-driven width spring; the menu mounts only while open through a Radix portal.

## Notes


- Use when one action is the default and two to five close variants exist. For a menu with no default action use dropdown-menu.
- Keep the menu actions as variations of the main action; put unrelated commands elsewhere.
- Swap label and icon (Copy page → Copied) to show the result in place.

## Related

- [Button](/components/button): A clear, responsive action with quiet secondary states.
- [Action button](/components/action-button): A compact button for frequent toolbar actions.
- [Copy button](/components/copy-button): Copy a value with immediate confirmation.
