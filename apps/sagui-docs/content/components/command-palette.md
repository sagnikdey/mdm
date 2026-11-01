---
title: Command palette
slug: command-palette
description: "A complete keyboard driven action surface with search, grouped results, and shortcuts."
category: navigation
component: CommandPalette
keywords:
  - react command palette
  - cmd k menu
  - command menu
  - spotlight search
  - cmdk alternative
  - keyboard command palette
  - quick actions
---

A complete keyboard driven action surface with search, grouped results, and shortcuts.

<!-- demo: Hero -->

## When to use


- App-wide command search opened with Cmd or Ctrl plus K.
- Jumping to pages, creating items, and running actions from one input.
- Inline search panels that group results with shortcuts.

## When not to use


- Use combobox to pick a value inside a form.
- Use dropdown-menu for a short list of actions.
- Use expanding-search or search-field to search page content.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { CommandPalette, type CommandItem } from "@sagui/ui";

const items: CommandItem[] = [
  { id: "new", label: "New project", group: "Create", shortcut: "N" },
  { id: "invite", label: "Invite teammate", group: "Team", keywords: ["member"] },
  { id: "theme", label: "Toggle theme", description: "Switch light and dark" },
];

export function Palette({ onClose }: { onClose: () => void }) {
  return <CommandPalette items={items} onSelect={item => run(item.id)} onClose={onClose} />;
}
```

## Examples

### In a dialog

Open it on demand inside a `Dialog`, with `autoFocus` so typing starts at once. `onClose` runs on Escape with an empty query.

<!-- demo: InDialog -->


## API reference


### CommandPalette

An inline search-and-run panel: a combobox input over grouped, filtered results with one highlight that follows the active row.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` (required) | `CommandItem[]` | – | Commands to search. Filtering matches label, description, group, and keywords. |
| `placeholder` | `string` | `"Search commands"` | Input placeholder. |
| `onSelect` | `(item: CommandItem) => void` | – | Called on click or Enter. The query then clears and focus returns to the input. |
| `onClose` | `() => void` | – | Called on Escape with an empty query. Also renders an Esc close button. |
| `label` | `string` | `"Command palette"` | Visually hidden label for the input. |

### CommandItem

Item type: { id: string; label: string; description?: string; group?: string; keywords?: string[]; icon?: ReactNode; shortcut?: string }. Items without a group land under Actions.

No props.

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Cmd/Ctrl + K | Focuses the search input from anywhere on the page. |
| ArrowDown / ArrowUp | Moves the active result. |
| Home / End | Jumps to the first or last result. |
| Enter | Runs the active result. |
| Escape | Clears the query, or calls onClose when it is already empty. |

## Accessibility


- The input is a combobox with aria-controls and aria-activedescendant pointing at the listbox option, so focus never leaves the input.
- Results are role=option buttons with aria-selected, grouped in labelled role=group containers.
- It renders inline, not in a modal. Put it in a dialog yourself if it should trap focus and close on outside click.

## Motion


- The panel rises in on a spring; the results frame springs to the list height as the query filters.
- Remaining rows glide into place when the shift is small and snap when it is a long jump; the highlight springs for pointer moves and slides in 70ms for arrow keys.
- Reduced motion removes the entrance, glides, and highlight travel.

## Responsive behavior


- It fills its container width; below 480px shortcut hints are hidden and padding tightens.
- Below 340px the footer drops its last hint.
- Results scroll inside a 342px maximum height, and long labels ellipsize.

## Performance


- Filtering is a simple substring match over label, description, group, and keywords on every keystroke.
- Rows are not virtualized and animate with layout; keep lists to a few hundred items or filter on the server.

## Notes


- Use for app-wide command search. For picking a value inside a form use combobox; for a small list of actions use dropdown-menu.
- Wrap it in dialog and pass onClose to close the dialog; map onSelect to your router or action handlers by item.id.

## Related

- [Dialog](/components/dialog): A focused surface for decisions that need attention.
- [Combobox](/components/combobox): Search and select from a list without leaving the field.
- [Expanding search](/components/expanding-search): An icon that morphs into a search field with results beneath it.
- [Search field](/components/search-field): A recognizable search entry point with clear affordances.
