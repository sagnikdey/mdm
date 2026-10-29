---
title: Theming and tokens
description: "Semantic tokens, dark mode, and how to override them."
---

Components only read semantic tokens, never raw colors. Change a token and every component follows.

## How tokens are layered

Tokens come in two tiers, generated from `packages/tokens/tokens.json`, the same structure as the Figma variables.

1. **Primitives** are raw values with no meaning attached: color ramps such as `--sg-blue-600` and `--sg-neutral-warm-100`, plus sizes, radii and font values. Components never read them.

   Two brand ramps sit alongside them. **Brand 1** (`--sg-brand-1-*`) is a deep teal that drives the accent; **Brand 2** (`--sg-brand-2-*`) is raspberry, for highlights. Teal is light for how dark it is, so the accent uses `brand-1-700` in light mode and `brand-1-400` in dark, with hover at 800, active at 900 and the focus ring at 600.
2. **Semantic tokens** say what a value is for, such as `--sg-accent-default` or `--sg-fg-muted`. Each points at a primitive, and color tokens point at a different primitive in dark mode. Tailwind exposes them as utilities: `bg-accent-default`, `text-fg-muted`, `border-border-default`.

To restyle the system, point semantic tokens at other primitives, or override them directly.

```css
:root {
  --sg-accent-default: var(--sg-brand-2-600);
  --sg-accent-hover: var(--sg-brand-2-700);
}

[data-theme="dark"] {
  --sg-accent-default: var(--sg-brand-2-400);
}
```

## Colors

| Group | Tokens | Use |
| --- | --- | --- |
| `bg` | `canvas`, `surface`, `muted`, `emphasis` | Page background, raised surfaces (fields, cards, menus), quiet fills, and inverted fills such as tooltips. |
| `fg` | `default`, `subtle`, `muted`, `on-accent`, `on-danger`, `on-emphasis` | Text and icons, and text on top of filled colors. |
| `border` | `subtle`, `default`, `strong`, `focus`, `focus-soft` | Dividers, hairlines, input borders and focus rings. |
| `accent` | `default`, `hover`, `active`, `subtle`, `subtle-hover`, `border` | The main action and selected states. |
| `secondary` | `default`, `hover`, `fg` | Secondary actions. |
| `success` / `warning` / `danger` | `default`, `subtle`, `border` (danger adds `hover`) | Status: solid color, tinted fill, and tinted border. |
| `interactive` | `hover`, `pressed`, `track`, `track-hover`, `thumb` | Translucent overlays for rows and ghost controls, and switch parts. |
| `on-accent` | `hover`, `divider`, `muted` | Overlays on top of an accent fill, such as split button dividers. |
| `chart` | `1` to `4` | Data series. |
| `elevation` | `resting`, `raised-*`, `floating-*`, `overlay-*` | Shadow colors, denser in dark mode. |

Tints are solid ramp steps, not opacity, so they look the same on any background. Alpha is used only for overlays and shadows.

### Spacing, radius and type

- **Spacing** follows Tailwind's scale on a 4px base (`--sg-space-3` is 12px, the same as `gap-3`), plus `--sg-space-neg-1_5` for overlaps.
- **Radius roles**: `rounded-inner`, `rounded-control-sm`, `rounded-control`, `rounded-container`, `rounded-overlay`, `rounded-pill`.
- **Border widths**: `--sg-border-width-{default, thick, focus}`.
- **Controls**: `--sg-control-height-{xs, sm, md, lg}` and `--sg-control-padding-x-{sm, md, lg}`.
- **Type**: `--sg-text-{step}-{size, line-height, tracking}` and the `type-*` roles.

### Older names

The names from before the two tiers (`bg-primary`, `text-muted-foreground`, `--sg-primary` and so on) still work. They now point at the new tokens and will be removed in a future major version.

| Old | New |
| --- | --- |
| `background` / `foreground` | `bg-canvas` / `fg-default` |
| `surface` / `muted` | `bg-surface` / `bg-muted` |
| `muted-foreground` | `fg-muted` |
| `border` / `border-strong` / `ring` | `border-default` / `border-strong` / `border-focus` |
| `primary` / `primary-foreground` | `accent-default` / `fg-on-accent` |
| `secondary` / `secondary-foreground` | `secondary-default` / `secondary-fg` |
| `destructive` / `destructive-foreground` | `danger-default` / `fg-on-danger` |
| `success` / `warning` | `success-default` / `warning-default` |

The `fg-on-*` tokens keep their contrast on their fills in both themes. When you override a fill, override its `fg-on-*` pair too.

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

Dark values are defined under `[data-theme="dark"]`. Tailwind's `dark:` variant is wired to the same attribute, so `dark:bg-bg-muted` works in your own classes too.

## Using tokens in your own code

```tsx
<div className="rounded-[var(--radius-lg)] border border-border-default bg-bg-surface p-4 shadow-raised">
  <p className="text-sm text-fg-muted">Uses the same tokens as the components.</p>
</div>
```
