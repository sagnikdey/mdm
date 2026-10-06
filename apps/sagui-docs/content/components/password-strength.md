---
title: Password strength
slug: password-strength
description: "Show how strong a new password is while it is typed."
category: inputs
component: PasswordStrength
keywords:
  - password
  - strength meter
  - validation
  - react password strength
  - password strength meter
  - password requirements checklist
  - new password field
  - password validation
  - signup password
---

Show how strong a new password is while it is typed.

<!-- demo: Hero -->

## When to use


- Sign up and change password forms.
- Password rules that should check off live as the person types.

## When not to use


- Use password-field for sign in.
- Use progress for measurable progress unrelated to passwords.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { PasswordStrength } from "@sagui/ui";

export function NewPasswordField() {
  const [strong, setStrong] = useState(false);
  return (
    <PasswordStrength
      label="New password"
      name="password"
      autoComplete="new-password"
      onValueChange={(_, strength) => setStrong(strength.level >= 3)}
    />
  );
}
```

## Examples

### Custom rules

Strength is the share of rules met, spread over four steps. Each rule can report how many characters are still missing with `remaining`.

<!-- demo: CustomRules -->

### Gating a submit button

`onValueChange` receives the strength result. Scoring runs on the device, so you can enable the button once the level is high enough.

<!-- demo: GateSubmit -->

### With an error

The field shakes once each time a new error appears.

<!-- demo: WithError -->


## API reference


### PasswordStrength

A new-password field with a four-segment meter, rule checklist, and a morphing strength word.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Visible label tied to the input. |
| `value` | `string` | – | Controlled password. |
| `defaultValue` | `string` | `""` | Initial value when uncontrolled. |
| `onValueChange` | `(value: string, strength: PasswordStrengthResult) => void` | – | Called on every change with the value and its { level, label, met } score. |
| `rules` | `PasswordRule[]` | `defaultPasswordRules` | { id, label, test, remaining? } rules. Strength is the share met across four steps. |
| `error` | `string` | – | Error copy; sets aria-invalid and shakes the field once per new error. |
| `revealed` | `boolean` | – | Controlled show or hide state. |
| `onRevealedChange` | `(revealed: boolean) => void` | – | Called when the reveal toggle is pressed. |
| `...props` | `Omit<InputHTMLAttributes<HTMLInputElement>, "type" \| "value" \| "defaultValue" \| "children">` | – | Forwarded to the input, including ref, name, autoComplete, and onChange. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / Space | On the reveal button, shows or hides the password. |

## Accessibility


- The meter is role="meter" with aria-valuenow 0 to 4 and aria-valuetext set to the strength word.
- The rules list is linked to the input through aria-describedby along with any error; errors set aria-invalid.
- A role="status" region summarizes strength and rules met; the reveal button uses aria-pressed and aria-controls.

## Motion


- Segments fill and change tone in a staggered wave, rules check off with drawn ticks, remaining counts roll, and the word morphs up or down with strength.
- Reduced motion, applied after hydration, drops the shake, wave, and roll in favor of instant changes.

## Responsive behavior


- On coarse pointers the input grows to the base font size, so iOS does not zoom on focus.
- The four-segment meter shares the row width evenly and shrinks with the column.

## Performance


- Scoring runs on the device on every keystroke with simple rule tests; there is no dictionary check.
- One ResizeObserver per field measures the helper row for its height spring; cheap for a form, but avoid hundreds in a table.

## Notes


- Use when creating or changing a password. Use password-field for sign in.
- Controlled or uncontrolled; read strength from onValueChange to gate submit. Scoring runs on the device.
- Also exports estimateStrength(password, rules) and defaultPasswordRules for server-side checks or custom rule sets.

## Related

- [Password field](/components/password-field): Capture sensitive text with a visible reveal control.
- [Input](/components/input): A single line field with clear labels and useful states.
