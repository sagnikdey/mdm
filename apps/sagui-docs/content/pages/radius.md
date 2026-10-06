---
title: Radius
description: "A corner radius scale and the roles that decide which corner each surface gets."
---

Corners get larger as surfaces get larger. A button is gently rounded, a card a little more, and a dialog the most. This keeps small controls crisp and big surfaces soft, and it keeps nested corners concentric.

## Scale

<!-- demo: Scale -->

| Token | Value | Utility |
| --- | --- | --- |
| `--radius-xs` | 4px | `rounded-xs` |
| `--radius-sm` | 6px | `rounded-sm` |
| `--radius-md` | 10px | `rounded-md` |
| `--radius-lg` | 14px | `rounded-lg` |
| `--radius-xl` | 20px | `rounded-xl` |
| `--radius-2xl` | 28px | `rounded-2xl` |
| `--radius-pill` | 9999px | `rounded-pill` (or `rounded-full`) |

## Roles

Most code should not pick a step directly. Pick the role of the surface instead, and the role points at a step.

<!-- demo: Roles -->

| Role | Points at | Used by |
| --- | --- | --- |
| `--radius-control` | `--radius-md` (10px) | Buttons, inputs, selects, segmented controls. |
| `--radius-container` | `--radius-lg` (14px) | Cards, alerts, groups, tab lists. |
| `--radius-overlay` | `--radius-xl` (20px) | Menus, popovers, dialogs, sheets. |
| `--radius-pill` | 9999px | Badges, chips, switches, avatars. |

Each role is also a utility: `rounded-control`, `rounded-container`, `rounded-overlay`, `rounded-pill`.

```tsx
<div className="rounded-container border border-border bg-surface p-4">…</div>
```

## Concentric corners

When one rounded surface sits inside another, the inner radius should be the outer radius minus the padding between them. Equal radii make the gap look pinched at the corners.

<!-- demo: Concentric -->

```tsx
<div className="rounded-[20px] p-2">
  <div className="rounded-[12px]">…</div>
</div>
```

## Restyling

Components read the scale tokens, so changing the scale restyles every component at once. Override the values on `:root`, or on any element to restyle just that part of the page.

<!-- demo: Restyle -->

```css
:root {
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  --radius-xl: 8px;
}
```

Keep the order of the steps when you change them, so larger surfaces still get the larger corner.

## Guidelines

- Pick by role, not by look: a card is `container` even when it is small.
- Pills are for compact, self-contained items. A full-width field with pill corners looks like a button.
- Avoid rounding only some corners, except where a surface meets an edge, like a bottom sheet's top corners.
- Images inside a container clip to its corner through `overflow-hidden`; do not round the image separately.
