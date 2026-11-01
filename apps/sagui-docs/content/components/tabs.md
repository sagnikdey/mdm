---
title: Tabs
slug: tabs
description: "Switch between related content in the same context."
category: navigation
component: Tabs
keywords:
  - navigation
  - layout
  - react tabs
  - animated tabs
  - radix tabs
  - tab component
  - sliding tab indicator
  - scrollable tabs
  - tabs with animation
---

Switch between related content in the same context.

<!-- demo: Hero -->

## When to use


- Peer views of the same object, such as Overview, Activity, and Settings.
- Panels with different heights, where the container should spring between them.
- Long tab sets that need to scroll horizontally with edge buttons.

## When not to use


- Use segmented-control for a compact value toggle not tied to panels.
- Use accordion for stacked sections people read in order.
- Use liquid-tab-bar or morph-nav for app-level navigation between routes.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sagui/ui";

export function ProjectTabs() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Project">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Summary and stats</TabsContent>
      <TabsContent value="activity">Recent events</TabsContent>
    </Tabs>
  );
}
```

## Examples

### Controlled

Pass `value` and `onValueChange` to own the selection. The pill and panels still animate.

<!-- demo: Controlled -->

### Overflowing tabs

When the triggers do not fit, the list scrolls with edge fades and arrow buttons, and keeps the active tab in view.

<!-- demo: Overflow -->

### A disabled tab

<!-- demo: Disabled -->


## API reference


### Tabs

Radix Tabs root that tracks direction so panels slide the way the selection moved.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | – | Controlled active tab value. |
| `defaultValue` | `string` | – | Initial active tab when uncontrolled. |
| `onValueChange` | `(value: string) => void` | – | Called when the active tab changes. |
| `...props` | `ComponentPropsWithoutRef<typeof TabsPrimitive.Root>` | – | Other Radix root props such as activationMode and className. |

### TabsList

Scrollable tab strip. Shows edge scroll buttons when triggers overflow and keeps the active tab in view.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ComponentPropsWithoutRef<typeof TabsPrimitive.List>` | – | Radix list props, including aria-label and loop. |

### TabsTrigger

A tab with a shared selection pill that glides between triggers.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` (required) | `string` | – | Matches a TabsContent value. |
| `...props` | `ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>` | – | Radix trigger props such as disabled. |

### TabsContent

Panel that slides in and morphs its height from the previous panel.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` (required) | `string` | – | Matches a TabsTrigger value. |
| `forceMount` | `true` | – | Keeps the panel mounted and skips the enter and exit animation. |
| `...props` | `ComponentPropsWithoutRef<typeof TabsPrimitive.Content>` | – | Radix content props such as className. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| ArrowLeft / ArrowRight | Moves between tabs and activates them. |
| Home / End | Jumps to the first or last tab. |
| Tab | Moves focus from the tab list into the active panel. |

## Accessibility


- Radix provides role="tablist", role="tab", role="tabpanel", aria-selected, and aria-controls.
- The outgoing panel is made inert while it fades so it cannot take focus.
- Overflow scroll buttons are labelled "Scroll tabs left" and "Scroll tabs right"; give TabsList an aria-label.

## Motion


- The selection pill glides between triggers on a morph spring, scoped to one Tabs instance.
- Panels slide 8px in the direction of travel while the height springs from the previous panel.
- Reduced motion swaps the pill instantly and crossfades panels in place without height animation.

## Responsive behavior


- The tab list keeps max-width 100% and scrolls horizontally when triggers overflow, with scroll buttons at the edges.
- Focusing a tab scrolls it into view, so keyboard navigation works on narrow screens.
- Triggers keep a 5.5rem minimum width, so many tabs overflow sooner on mobile.

## Performance


- ResizeObservers track list overflow and the active panel height; one per Tabs instance is cheap.
- The selection pill is a shared layout animation scoped to one Tabs; avoid dozens of tab sets on one screen.

## Notes


- Use for peer views of the same object. Use segmented-control for a compact value toggle that is not tied to panels, and accordion for stacked sections.
- Every TabsTrigger value needs a matching TabsContent. Long lists scroll horizontally on their own.

## Related

- [Segmented control](/components/segmented-control): Switch between a small set of related views.
- [Accordion](/components/accordion): Progressively reveal supporting information in place.
