---
title: Switch
slug: switch
description: "A tactile toggle for settings that take effect immediately."
category: selection
component: Switch
keywords:
  - toggle
  - settings
  - react switch
  - toggle switch
  - ios toggle
  - radix switch
  - settings toggle
  - animated switch
---

A tactile toggle for settings that take effect immediately.

<!-- demo: Hero -->

## When to use


- Settings that take effect as soon as they are flipped, like notifications.
- Settings lists where each row is one on and off preference.

## When not to use


- Use checkbox when the choice waits for a submit button.
- Use segmented-control for a choice between named options.
- Use theme-switch for a light and dark toggle.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Switch } from "@sagui/ui";

export function NotificationsToggle() {
  const [enabled, setEnabled] = useState(true);
  return <Switch label="Email notifications" checked={enabled} onCheckedChange={setEnabled} />;
}
```

## Examples

### Uncontrolled

<!-- demo: Uncontrolled -->

### Without a visible label

Pass `aria-label` when the surrounding layout already names the setting.

<!-- demo: IconOnly -->

### Disabled

<!-- demo: Disabled -->


## API reference


### Switch

A Radix switch whose thumb stretches while pressed and travels on a spring.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | – | Visible label inside the switch; also used as aria-label when none is passed. |
| `checked` | `boolean` | – | Controlled state. |
| `defaultChecked` | `boolean` | `false` | Initial state when uncontrolled. |
| `onCheckedChange` | `(checked: boolean) => void` | – | Called on every toggle. |
| `...props` | `ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>` | – | Radix Switch root props, including ref, name, disabled, and aria-label. Pointer and key handlers are chained, not replaced. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Space / Enter | Toggles the switch. Holding Space stretches the thumb until release. |

## Accessibility


- Radix renders a button with role="switch" and aria-checked.
- The label prop becomes aria-label unless one is passed; icon-only usage needs an aria-label.

## Motion


- Pressing stretches the thumb toward the other side like a held finger; releasing sends it across on a snappy spring.
- Reduced motion removes the stretch and moves the thumb instantly; CSS transitions are also disabled.

## Responsive behavior


- The switch is inline and keeps a control-height minimum, so the whole label is a touch target.
- Hover styles apply only on fine pointers; touch gets the press stretch.

## Performance


- Motion is CSS transitions on the track and thumb, with no observers or per-frame work.

## Notes


- Use for settings that take effect immediately. Use checkbox for choices confirmed by a submit button.
- Exported both as a named and a default export.
- Pass name to submit with a form through Radix's hidden input.

## Related

- [Checkbox](/components/checkbox): A binary choice with a precise, legible state.
- [Segmented control](/components/segmented-control): Switch between a small set of related views.
