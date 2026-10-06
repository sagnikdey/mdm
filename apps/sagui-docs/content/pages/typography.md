---
title: Typography
description: "Typefaces, the type scale, and the semantic roles that set size, line height, weight and tracking together."
---

SagUI sets text in **Inter** for the interface and **JetBrains Mono** for code. Type is defined in two layers: a numeric **scale** (`text-xs` to `text-6xl`), and a set of **roles** (`type-h1`, `type-body`, `type-caption` and so on) that bundle size, line height, weight and letter spacing. Use the roles for headings and copy. Reach for the scale only when you need a size without the rest of a role.

## Type roles

Each role is a single utility class. It sets the `font` shorthand from a token, plus tracking and wrapping, so headings and copy stay consistent without remembering four classes.

<!-- demo: Roles -->

| Role | Size / line height | Weight | Tracking | Use |
| --- | --- | --- | --- | --- |
| `type-display` | 40–60px fluid / 1.05 | 600 | −0.035em | Marketing heroes. One per page. |
| `type-h1` | 32–40px fluid / 1.1 | 600 | −0.03em | Page titles. |
| `type-h2` | 24px / 1.25 | 600 | −0.02em | Section headings. |
| `type-h3` | 18px / 1.4 | 600 | −0.01em | Subsections and dialog titles. |
| `type-title` | 16px / 1.4 | 500 | −0.01em | Card and list item titles. |
| `type-body-lg` | 18px / 1.6 | 400 | −0.005em | Lead paragraphs. |
| `type-body` | 16px / 1.6 | 400 | 0 | Reading copy. |
| `type-body-sm` | 14px / 1.5 | 400 | 0 | Dense UI copy: tables, cards, menus. |
| `type-label` | 14px / 1.25 | 500 | 0 | Field labels and button text. |
| `type-caption` | 12px / 1.35 | 400 | 0.005em | Metadata, timestamps, helper text. |
| `type-overline` | 11px / 1.2 | 500 | 0.08em, uppercase | Eyebrows above headings. |
| `type-code` | 13px / 1.6 | 400 mono | 0 | Inline code and tokens. |

Display and h1 scale with the viewport through `clamp()`, so a page title never needs breakpoint classes. Headings use `text-wrap: balance` and body copy uses `text-wrap: pretty`, which avoids single-word last lines.

```tsx
<p className="type-overline text-muted-foreground">Billing</p>
<h2 className="type-h2">Upgrade to Pro</h2>
<p className="type-body text-muted-foreground">Unlimited projects and priority support.</p>
```

## In context

Roles combine with color utilities. Hierarchy comes from size and weight first, then from `text-muted-foreground` for secondary copy, never from color alone.

<!-- demo: Composition -->

## Type scale

The scale is Tailwind's sizes, owned by the token file so every step is explicit. Each step carries its own line height, and the steps from `text-xl` up tighten their letter spacing as they grow, since large text set at default tracking looks loose.

<!-- demo: Scale -->

| Utility | Size | Line height | Tracking |
| --- | --- | --- | --- |
| `text-xs` | 12px | 16px | 0 |
| `text-sm` | 14px | 20px | 0 |
| `text-base` | 16px | 24px | 0 |
| `text-lg` | 18px | 28px | 0 |
| `text-xl` | 20px | 28px | −0.01em |
| `text-2xl` | 24px | 32px | −0.02em |
| `text-3xl` | 30px | 36px | −0.025em |
| `text-4xl` | 36px | 40px | −0.03em |
| `text-5xl` | 48px | 1.1 | −0.035em |
| `text-6xl` | 60px | 1.05 | −0.04em |

Components are built on `text-sm` (14px) for controls and `text-xs` (12px) for metadata. An explicit `tracking-*` or `leading-*` class still overrides a step's defaults.

## Weights

Four weights are available. The interface mostly uses two: **400** for reading and **500** for labels, titles and buttons. Headings use **600**. Keep **700** for rare emphasis.

<!-- demo: Weights -->

## Numbers

Inter's figures are proportional by default, which reads best in sentences. Use `tabular-nums` wherever numbers line up or change in place: tables, prices, counters, timers. SagUI's MetricCard, AnimatedCounter, NumberField, MoneyInput and PhoneInput already do.

<!-- demo: Numbers -->

## Loading the fonts

The token file names the families but does not load them, so your app decides how fonts are served. With Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=JetBrains+Mono:wght@400..600&display=swap" />
```

To use another typeface, override the family tokens after importing the styles:

```css
@theme {
  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;
}
```

Without a loaded font, text falls back to the system UI font, which keeps the same metrics closely enough that layouts hold.

## Guidelines

- Keep reading lines between 45 and 75 characters. `max-w-[60ch]` on body copy is a good default.
- Use one `type-display` or `type-h1` per page, and do not skip heading levels for size. Pick the element for structure and the role for looks.
- Do not set interface text below 12px. Captions are the floor.
- Inputs on touch devices should be at least 16px, or iOS zooms the page on focus. SagUI fields use 14px, so use `text-base` on fields in mobile-first forms.
- Prefer weight and size over color for hierarchy, and use `text-muted-foreground`, not lowered opacity, for secondary text so contrast stays predictable.

## Accessibility

- All sizes are in `rem`, so text follows the reader's browser font size and zoom.
- `foreground` and `muted-foreground` meet WCAG AA contrast (4.5:1) on `background` and `surface` in both themes.
- Uppercase overlines use wide tracking to stay legible. Keep them to a few words, since all caps slows reading.

## Tokens

| Token | Value |
| --- | --- |
| `--font-sans` | Inter, ui-sans-serif, system-ui, sans-serif |
| `--font-mono` | JetBrains Mono, ui-monospace, monospace |
| `--text-{step}` | Size, with `--text-{step}--line-height` and `--text-{step}--letter-spacing` |
| `--font-weight-{normal,medium,semibold,bold}` | 400, 500, 600, 700 |
| `--type-{role}` | A `font` shorthand: weight, size / line height, family |
