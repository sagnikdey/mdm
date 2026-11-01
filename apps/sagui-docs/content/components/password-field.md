---
title: Password field
slug: password-field
description: "Capture sensitive text with a visible reveal control."
category: inputs
component: PasswordField
keywords:
  - field
  - security
  - react password input
  - show hide password
  - password toggle
  - password field with eye icon
  - login password field
---

Capture sensitive text with a visible reveal control.

<!-- demo: Hero -->

## When to use


- Sign in forms and password confirmation fields.
- Any secret the person may want to check by revealing it.

## When not to use


- Use password-strength when creating or changing a password.
- Use input for non-secret values.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { PasswordField } from "@sagui/ui";

export function SignInPassword() {
  return (
    <PasswordField
      label="Password"
      name="password"
      autoComplete="current-password"
      required
    />
  );
}
```

## Examples

### With a description

<!-- demo: WithDescription -->

### With an error

<!-- demo: WithError -->


## API reference


### PasswordField

A password input with a show and hide toggle whose eye icon is slashed by a drawn line.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` (required) | `string` | – | Visible label tied to the input. |
| `description` | `string` | – | Helper copy under the field, linked through aria-describedby. |
| `error` | `string` | – | Error copy. Sets aria-invalid, colors the border, and renders in a role="alert" row. |
| `...props` | `Omit<InputHTMLAttributes<HTMLInputElement>, "type">` | – | Forwarded to the input, including ref, value, onChange, name, and autoComplete. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / Space | On the toggle button, shows or hides the password. |

## Accessibility


- Toggle is a native button with aria-pressed and a label that switches between "Show password" and "Hide password".
- Description is linked through aria-describedby.
- Set autoComplete to current-password or new-password so password managers work.

## Motion


- A slash draws across the eye and masks the outline beneath it instead of swapping icons.
- After the first toggle, the value resolves through a short CSS reveal on each change; reduced motion draws the slash instantly.

## Responsive behavior


- The field fills its column; the reveal button sits inside the shell, so it never wraps below the input.
- Hover styles apply only on fine pointers.

## Performance


- One ResizeObserver per field measures the helper row for its height spring; cheap for a form, but avoid hundreds in a table.
- The reveal effect is a short CSS animation, and the slash is one drawn path.

## Notes


- Use for sign in and password confirmation. Use password-strength when the user is creating a new password.
- Uncontrolled by default; pass value and onChange to control it like a native input.

## Related

- [Password strength](/components/password-strength): Show how strong a new password is while it is typed.
- [Input](/components/input): A single line field with clear labels and useful states.
