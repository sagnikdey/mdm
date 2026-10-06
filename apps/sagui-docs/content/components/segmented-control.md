---
title: Segmented control
slug: segmented-control
description: "Switch between a small set of related views."
category: selection
component: SegmentedControl
keywords:
  - control
  - choice
  - react segmented control
  - segmented button
  - toggle group
  - ios segmented control
  - view switcher
  - sliding pill toggle
---

Switch between a small set of related views.

<!-- demo: Hero -->

## When to use


- Two to five short view options like Day, Week, and Month.
- Toolbar toggles between layouts or modes that apply immediately.

## When not to use


- Use tabs when each option swaps a panel of content.
- Use radio-group in forms or when options need descriptions.
- Use switch for a single on and off setting.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import SegmentedControl from "@sagui/ui";

export function RangeToggle() {
  const [range, setRange] = useState("week");
  return (
    <SegmentedControl
      label="Range"
      value={range}
      onValueChange={setRange}
      options={[
        { value: "day", label: "Day" },
        { value: "week", label: "Week" },
        { value: "month", label: "Month" },
      ]}
    />
  );
}
```

## Examples

### With accessories

An accessory, such as a count, renders after the label.

<!-- demo: WithAccessory -->

### When options do not fit

The track scrolls inside its frame, fades only the edge with more to see, and keeps the selected option in view.

<!-- demo: Overflowing -->


## API reference


### SegmentedControl

A row of toggle buttons with one selection pill that slides between them.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` (required) | `{ value: string; label: string; accessory?: ReactNode }[]` | – | Segments in order. An accessory, such as a badge, renders after the label. |
| `value` | `string` | – | Selected value. Controlled. |
| `defaultValue` | `string` | First option | Initial value when uncontrolled. |
| `onValueChange` | `(value: string) => void` | – | Called with the chosen segment's value, from a click or the arrow, Home and End keys. |
| `label` | `string` | – | aria-label for the group. |
| `onOptionIntent` | `(value: string) => void` | – | Called when the pointer or focus reaches a segment before it is chosen, to start loading what it shows. |
| `className` | `string` | – | Extra class on the root. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Tab | Moves focus into the control, onto the selected segment, and out again. |
| Arrow keys | Select and focus the previous or next segment, wrapping at the ends. |
| Home / End | Select the first or last segment. |

## Accessibility


- Renders role="group" labelled by label, with native buttons using aria-pressed for the selected segment. Only the selected segment is a tab stop.
- The sliding pill is aria-hidden.

## Motion


- A shared layoutId pill slides to the selected segment on the morph spring, scoped per instance by a LayoutGroup.
- Reduced motion moves the pill instantly and disables button transitions.

## Responsive behavior


- The row is inline with max-width 100% and scrolls horizontally with a hidden scrollbar when segments do not fit.
- Segments never shrink or wrap, so keep labels short on mobile.

## Performance


- One shared layoutId pill per instance, scoped by a LayoutGroup; no observers.

## Notes


- Use for two to five short, mutually exclusive view options like time ranges or layouts. Use tabs when each option swaps a panel, and radio-group in forms.
- Always controlled. Import it as a default export.

## Related

- [Radio group](/components/radio-group): Choose one option from a visible set.
- [Switch](/components/switch): A tactile toggle for settings that take effect immediately.
