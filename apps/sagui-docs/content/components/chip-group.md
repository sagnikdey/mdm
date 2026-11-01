---
title: Chip group
slug: chip-group
description: "Filter by a few facets with chips that morph as you pick them."
category: selection
component: ChipGroup
keywords:
  - chips
  - filter
  - toggle
  - react chip group
  - filter chips
  - toggle chips
  - tag filter
  - selectable chips
  - chip select
---

Filter by a few facets with chips that morph as you pick them.

<!-- demo: Hero -->

## When to use


- Facet filters people toggle often, like topics or categories.
- Single clearable choices shown as chips, via multiple={false}.
- Long option sets folded behind a +N more chip with maxVisible.

## When not to use


- Use multi-select when space is tight.
- Use checkbox in forms.
- Use segmented-control for one choice among a few views.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { ChipGroup } from "@sagui/ui";

export function TopicFilter() {
  const [topics, setTopics] = useState<string[]>([]);
  return (
    <ChipGroup
      label="Topics"
      value={topics}
      onValueChange={setTopics}
      maxVisible={4}
      options={["Design", "Motion", "Code", "Research", "Writing"].map((t) => ({ value: t.toLowerCase(), label: t }))}
    />
  );
}
```

## Examples

### Single selection

With `multiple` off, picking a chip replaces the selection, and the selected chip can still be cleared.

<!-- demo: Single -->

### Folding long sets

Chips beyond `maxVisible` fold behind a "+N more" chip that opens with a height morph. Selected chips always stay in view.

<!-- demo: Folded -->


## API reference


### ChipGroup

Toggleable filter chips that morph when selected and fold long sets behind a +N more chip.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` (required) | `{ value: string; label: string }[]` | – | Chips in order. |
| `value` | `string[]` | – | Selected values. Controlled. |
| `defaultValue` | `string[]` | `[]` | Initial selection when uncontrolled. |
| `onValueChange` | `(value: string[]) => void` | – | Called with the new selection, in option order. |
| `label` (required) | `string` | – | Accessible name of the group, such as "Topics". |
| `multiple` | `boolean` | `true` | Allow several chips. In single mode the selected chip can still be cleared. |
| `maxVisible` | `number` | `Infinity` | Chips shown before the rest fold. Selected chips always stay in view. |
| `className` | `string` | – | Added to the group. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Arrow keys | Move focus between chips and the more chip, wrapping. |
| Home / End | Focus the first or last chip. |
| Enter / Space | Toggles the focused chip or opens the overflow. |

## Accessibility


- The group has role="group" and aria-label; each chip is a button with aria-pressed.
- Roving tabindex keeps one chip in the tab order; the more chip uses aria-expanded.
- Check icons and surfaces are aria-hidden.

## Motion


- Selecting grows a check in, slides the label over, and springs the chip edge while neighbours glide to new places, even across lines. Revealed chips stagger in and the group height morphs.
- Reduced motion replaces the morphs with short fades.

## Responsive behavior


- Chips wrap onto new lines and the frame height follows on a spring.
- Selected chips always stay visible, even beyond maxVisible, so folding never hides active filters.

## Performance


- Every chip has layout position animation and its own ResizeObserver; keep sets to a few dozen and fold the rest.
- Revealed chips stagger in, capped at 0.3s total.

## Notes


- Use for facet filters people toggle often. Use multi-select when space is tight and checkbox in forms.
- Always controlled. Set multiple={false} for a single, clearable choice.
- Exported as both named and default.

## Related

- [Multi-select](/components/multi-select): Select several values while keeping the field readable.
- [Segmented control](/components/segmented-control): Switch between a small set of related views.
- [Tag input](/components/tag-input): Turn short text values into removable tags.
