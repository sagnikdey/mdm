---
title: Button group
slug: button-group
description: "Related actions joined into one surface with hairline dividers: a hover highlight glides between segments, the pressed one answers in place, and an attached menu can close the row."
category: buttons
component: ButtonGroup
keywords:
  - action
  - group
  - toolbar
  - new
  - button group
  - joined buttons
  - action group
  - segmented buttons
  - button bar
  - attached buttons
  - zoom controls
  - more actions
  - dropdown
  - split
  - actions
---

Related actions joined into one surface with hairline dividers: a hover highlight glides between segments, the pressed one answers in place, and an attached menu can close the row.

<!-- demo: Hero -->

## When to use


- A small set of related actions on the same object, shown together in a header, toolbar or card footer.
- Compact tool clusters such as zoom out, the current level and zoom in, or stacked map controls.
- A primary action row, such as Reply, Reply all and Forward on a message.

## When not to use


- Use toggle-group or segmented-control when the segments are options that stay selected.
- Use split-button when there is one main action and a few variants of it.
- Use separate buttons when the actions are unrelated or one of them is much more important than the rest.
- Use tabs for switching between views.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Archive, Check, CopyPlus, Link, Pin, Trash2 } from "lucide-react";
import { ButtonGroup } from "@sagui/ui";

export function DocumentActions({ doc }: { doc: Doc }) {
  const [copied, setCopied] = useState(false);
  return (
    <ButtonGroup
      label="Document actions"
      items={[
        {
          id: "share",
          label: copied ? "Copied" : "Share",
          reserve: ["Share", "Copied"],
          icon: copied ? <Check /> : <Link />,
          onSelect: async () => {
            await navigator.clipboard.writeText(doc.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          },
        },
        { id: "duplicate", label: "Duplicate", icon: <CopyPlus />, onSelect: () => duplicate(doc.id) },
        { id: "archive", label: "Archive", icon: <Archive />, onSelect: () => archive(doc.id) },
      ]}
      menu={{
        label: "More actions",
        items: [
          { id: "pin", label: "Pin to sidebar", icon: <Pin />, onSelect: () => pin(doc.id) },
          { id: "delete", label: "Delete", icon: <Trash2 />, destructive: true, onSelect: () => remove(doc.id) },
        ],
      }}
    />
  );
}
```

## Examples

### Solid

Solid takes the primary fill, for the main actions of a view.

<!-- demo: Solid -->

### Small

Small matches the 32px button height. Use it in dense toolbars and table headers.

<!-- demo: Small -->

### Confirming in place

List every label a segment can show in `reserve`. The segment is sized to the widest one, so "Share" can answer "Copied" without anything around it moving.

<!-- demo: ConfirmInPlace -->

### Vertical, with a live value

`content` replaces the label with a live value. A vertical group suits zoom controls in a canvas corner.

<!-- demo: ZoomControls -->

### Disabled

<!-- demo: Disabled -->


## API reference


### ButtonGroup

Related actions joined into one surface with hairline dividers: a hover highlight glides between segments, the pressed one answers in place, and an attached menu can close the row.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` (required) | `{ id: string; label: string; reserve?: string[]; icon?: ReactNode; iconOnly?: boolean; content?: ReactNode; onSelect?: () => void; href?: string; disabled?: boolean }[]` | – | The segments in order. label is the visible text and the accessible name; changing it right after a press ("Share" to "Copied") crossfades in place and is announced. reserve lists every other label the segment can show, so it is sized to the widest and never resizes; a label nobody reserved springs the width instead. iconOnly shows only the icon and moves the label to aria-label and the tooltip. content replaces the visible label with a live value, such as a zoom level. href renders a link. |
| `label` (required) | `string` | – | Accessible name of the group, such as "Document actions". |
| `menu` | `{ label: string; items: { id: string; label: string; icon?: ReactNode; onSelect?: () => void; href?: string; disabled?: boolean; destructive?: boolean }[] }` | – | Adds a trailing chevron segment that opens more actions. menu.label names the chevron, such as "More actions". The menu aligns to the group's end edge (start edge when vertical). |
| `variant` | `"outline" \| "solid"` | `"outline"` | outline sits on a neutral surface with a quiet border. solid takes the primary button's fill, for the main actions of a view. |
| `size` | `"sm" \| "md"` | `"md"` | Matches the small and medium button heights. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Vertical stacks the segments, such as zoom controls on a canvas; arrow up and down then move between them. |
| `collapseLabels` | `boolean` | `true` | When a horizontal row no longer fits its container, segments with an icon drop their label and keep the icon (the label moves to aria-label and the tooltip). Labels return once the container is wide enough again. |
| `disabled` | `boolean` | `false` | Disables every segment and the menu. |
| `className` | `string` | – | Extra class on the group. |
| `style` | `CSSProperties` | – | Inline styles on the group. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Tab / Shift+Tab | Moves into, through and out of the group. Every segment is a tab stop, so the group behaves like the buttons it replaces. |
| Arrow right / Arrow left | Also moves between segments in a horizontal group, wrapping at the ends (mirrored in right to left layouts). |
| Arrow down / Arrow up | Moves between segments in a vertical group. On the chevron segment, Arrow down opens the menu instead. |
| Home / End | Moves to the first or last segment. |
| Enter / Space | Activates the focused segment. Link segments follow the link with Enter. |
| Enter / Space / Arrow down | On the chevron segment: opens the menu with the first item highlighted. |
| Arrow keys / Home / End | In the menu: moves between items, looping at the ends; disabled items are skipped. |
| Escape | Closes the menu and returns focus to the chevron. |
| Tab (menu open) | Closes the menu and moves on, since the menu is non-modal. |

## Accessibility


- The root is a div with role="group" named by label. Segments are native buttons (or links with href), so they keep their own roles and activation keys.
- Disabled segments use aria-disabled instead of the disabled attribute, so they stay focusable and are read as dimmed; their onSelect never runs. A disabled whole group uses the disabled attribute.
- Icon-only segments, segments with content and collapsed segments take their label as aria-label and as a tooltip; icons are hidden from assistive technology.
- When a segment's label changes within a second of its press, such as "Share" to "Copied", a polite live region in the group announces the new label once; the quiet return to "Share" is not announced.
- The chevron segment is a Radix dropdown trigger named by menu.label, with aria-expanded and aria-haspopup. The menu manages focus, typeahead, Escape and outside clicks, and returns focus to the chevron. It is non-modal, so opening it never locks scroll or shifts the page.
- Keyboard focus moves the same highlight the pointer does, and the focused segment also draws an inset focus ring. A mouse click focuses without the highlight, so nothing stays lit after the pointer leaves.
- State is never carried by color alone: confirmations change the label and icon, and disabled segments are dimmed and announced.

## Motion


- One highlight lives under all segments. Moving the pointer or keyboard focus to another segment carries it there on the snappy spring; arriving from outside the group it fades in where it lands, so it only travels between segments.
- The hairline dividers on either side of the highlighted segment fade out, so the highlight reads as one soft shape inside the joined surface.
- A press dips the segment's content to 0.97 (0.9 for icon-only) and springs back, while the highlight under it deepens. The group and its neighbours never move. The chevron anchors the menu, so it answers with the deeper highlight only.
- On touch, the highlight appears under the finger while pressed and fades on release.
- Nothing in the group moves or resizes on hover, focus, press, menu open or a label change: every reserved label sits invisibly in the segment, so a confirmation crossfades inside a fixed box. The new label rises in from a soft blur while the old one lifts away.
- A label that was not reserved never snaps either: the segment springs to its width on the morph spring, and the highlight stays locked to it while it resizes.
- The highlight is measured at sub-pixel precision, so it sits exactly on its segment at rest.
- The menu grows from the group's edge with a short offset and scale and leaves faster than it arrives; the chevron turns over while it is open.
- With reduced motion, the highlight jumps between segments, the press dip and chevron turn are removed, and labels and the menu crossfade.

## Responsive behavior


- A horizontal group never exceeds its container: when it would, segments with an icon drop their label (collapseLabels), and anything still too wide scrolls sideways without a visible scrollbar. At 320px the document example collapses to icons with its names kept as tooltips and aria-labels.
- The vertical orientation suits narrow rails and canvas corners; segments stretch to the widest one.
- Segments are 30px tall at sm and 38px at md inside the border, matching the 32px and 40px button heights. The highlight follows the pointer only for mouse and pen; touch gets it while pressed.

## Performance


- The highlight is one element moved by transforms and size motion values; segments never re-render on hover beyond a state update in the group.
- Two ResizeObservers per group keep the highlight on its segment and decide when labels collapse; each label slot has its own observer for the width morph.
- The menu renders only while open.

## Notes


- Choose it for two to five related actions on one object, such as a document's Share, Duplicate and Archive, or zoom controls. Put rarely used and destructive actions in menu.
- It is an action group: every segment does something now. For choosing one or more options that stay pressed, use toggle-group or segmented-control instead.
- Give confirmations by changing an item's label and icon ("Share" to "Copied") and resetting it after a moment, and list every label in reserve so the row never resizes. Keep confirmation labels close in length to the resting label, since the segment takes the widest.
- Use iconOnly only for actions with universally understood icons (zoom, alignment, playback). The label still names the action for screen readers and the tooltip.
- Use the solid variant for the main actions of a view, at most once per screen; outline for everything else.

## Related

- [Button](/components/button): A clear, responsive action with quiet secondary states.
- [Split button](/components/split-button): A primary action with a menu of nearby alternatives.
- [Floating button group](/components/floating-button-group): Separate soft buttons in a quiet tray, with one shared highlight that morphs from button to button as you move, and a pressed state that settles in place.
- [Expanding button group](/components/expanding-button-group): Icon buttons in a compact group: the one you point at or focus grows to reveal its label while its neighbours slide aside, and an action confirms in place.
