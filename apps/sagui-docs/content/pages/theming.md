---
title: Theming and tokens
description: "Semantic tokens, dark mode, and how to override them."
---

Components only read semantic tokens, never raw colors. Change a token and every component follows.

## How tokens are layered

Tokens come in two layers. Raw values live in `--sg-*` custom properties on `:root` (and `[data-theme="dark"]`). Tailwind's `@theme` block maps them to named theme values such as `--color-primary`, which is what utility classes like `bg-primary` read.

To restyle the system, override the `--sg-*` values.

```css
:root {
  --sg-primary: oklch(0.55 0.2 300);
  --sg-primary-foreground: oklch(0.99 0 0);
}

[data-theme="dark"] {
  --sg-primary: oklch(0.72 0.16 300);
}
```

## Colors

| Token | Use |
| --- | --- |
| `background` / `foreground` | Page background and default text. |
| `surface` | Raised surfaces: fields, cards, menus. |
| `muted` / `muted-foreground` | Quiet fills and secondary text. |
| `border` / `border-strong` | Hairlines, and the stronger border of inputs. |
| `ring` | Focus ring. |
| `primary` / `primary-foreground` | The main action. |
| `secondary` / `secondary-foreground` | Secondary actions. |
| `destructive` / `destructive-foreground` | Destructive actions and error text. |
| `success` | Confirmations and met requirements. |
| `warning` | Soft limits and caution. |

Foreground pairs keep their contrast in both themes. When you override a fill, override its foreground too.

## Typography, radius and elevation

These have their own foundation pages, with the full token tables and guidance:

- [Typography](/docs/typography): typefaces, the type scale and the `type-*` roles.
- [Radius](/docs/radius): the corner scale and the control, container, overlay and pill roles.
- [Shadow and elevation](/docs/elevation): five elevation levels, dark mode shadows and stacking order.

## Motion tokens

| Token | Value |
| --- | --- |
| `--duration-fast` | 120ms |
| `--duration-quick` | 160ms |
| `--duration-base` | 200ms |
| `--duration-standard` | 240ms |
| `--duration-slow` | 360ms |
| `--duration-spring` | 580ms, used with `--ease-spring` for transform transitions. |
| `--ease-out-quint` | Settles quickly. The default for fades and color changes. |
| `--ease-enter` | For things arriving. |
| `--ease-spring` | A spring with a gentle settle, as a `linear()` easing. |

Every duration token is set to 0 under `prefers-reduced-motion: reduce`. See [Motion](/docs/motion) for the JavaScript presets.

## Dark mode

Dark values are defined under `[data-theme="dark"]`. Tailwind's `dark:` variant is wired to the same attribute, so `dark:bg-muted` works in your own classes too.

## Using tokens in your own code

```tsx
<div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-raised">
  <p className="text-sm text-muted-foreground">Uses the same tokens as the components.</p>
</div>
```
