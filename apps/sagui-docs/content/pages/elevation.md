---
title: Shadow and elevation
description: "Five levels of elevation, the shadows that express them in light and dark themes, and how layers stack."
---

Elevation tells people what sits above what. SagUI uses five levels. Each level above the page has a shadow token, and surfaces at every level keep a 1px `border` so edges stay crisp where shadows are faint, especially in dark mode.

## Levels

<!-- demo: Levels -->

| Level | Token | Use |
| --- | --- | --- |
| 0 | none | The page and things laid out in it. Separate with borders and spacing. |
| 1 | `shadow-resting` | Controls and cards at rest: a hint that they sit on the page. |
| 2 | `shadow-raised` | Hovered cards, tooltips, small floating layers. |
| 3 | `shadow-floating` | Menus, selects, popovers, toasts, floating toolbars. |
| 4 | `shadow-overlay` | Dialogs and drawers, above a scrim. |

```tsx
<div className="rounded-container border border-border bg-surface shadow-resting">…</div>
```

## How the shadows are built

Each shadow pairs a wide, soft **ambient** layer with a tight **key** layer close to the edge. The ambient layer sets how high the surface floats; the key layer anchors its edge. Shadows are pure black at low opacity, so they darken whatever is underneath instead of tinting it.

| Token | Light | Dark |
| --- | --- | --- |
| `shadow-resting` | 0 1px 2px / 3.5% | 0 1px 2px / 30% |
| `shadow-raised` | 0 6px 18px / 6.5%, 0 1px 3px / 3.5% | 0 6px 18px / 36%, 0 1px 3px / 26% |
| `shadow-floating` | 0 20px 48px / 10.5%, 0 3px 10px / 4.5% | 0 20px 48px / 46%, 0 3px 10px / 30% |
| `shadow-overlay` | 0 32px 80px / 16%, 0 8px 24px / 7% | 0 32px 80px / 56%, 0 8px 24px / 34% |

## Dark mode

A dark page leaves little room for a shadow to darken, so dark values are much denser. The tokens switch automatically under `[data-theme="dark"]`. In dark mode the border carries more of the edge, which is why every elevated surface keeps one. Switch the theme in the header to compare.

To change the shadows, override the raw values for each theme:

```css
:root { --sg-shadow-floating: 0 16px 40px oklch(0% 0 0 / 0.12); }
[data-theme="dark"] { --sg-shadow-floating: 0 16px 40px oklch(0% 0 0 / 0.5); }
```

## Elevation and motion

A surface that responds to the pointer moves up one level as it lifts, so the shadow and the movement agree. Card rests at level 1 and lifts 2px to level 2 on hover. The lift only runs for a mouse, and not at all with reduced motion.

<!-- demo: Hover -->

## Layering

Shadows show height; the stacking order decides what actually covers what. From bottom to top:

| Layer | z-index | Components |
| --- | --- | --- |
| Inline popups | 30–40 | Panels rendered next to their field rather than in a portal: the phone and money input pickers, morph select, and the expanding search panel. |
| Modal scrim | 50 | The dimmed backdrop behind dialogs, drawers, sheets and the card quick look. |
| Modal panel | 51 | The dialog, drawer or sheet itself. |
| Menus | 60 | Dropdown menus, including split button menus. |
| Popovers | 80 | Popovers, combobox and multi-select lists. |
| Tooltips | 90 | Tooltips, which must clear everything they describe. |
| Select lists | 1000 | Radix Select content, which renders above all other layers. |

Within a modal, menus and popovers still layer above the panel, so a select inside a dialog opens on top of it.

<!-- demo: Layers -->

## Guidelines

- Use one level per job. Do not invent in-between shadows; if a surface needs to stand out more, it probably belongs one level up.
- Level 0 surfaces are separated with borders and spacing, never with a shadow.
- Pair level 4 with a scrim. A shadow alone does not make something modal.
- Do not animate `box-shadow` on many elements at once; animate it on the one element that moves.
