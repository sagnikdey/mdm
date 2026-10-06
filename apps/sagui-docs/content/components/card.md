---
title: Card
slug: card
description: "A contained group of related content and actions."
category: cards
component: Card
keywords:
  - surface
  - layout
  - react card
  - card component
  - card with image
  - expand card to modal
  - quick look card
  - shared layout card
  - project card
---

A contained group of related content and actions.

<!-- demo: Hero -->

## When to use


- Browsable items in a grid, such as projects, listings, or posts.
- Items that should open into a larger quick look dialog without leaving the page, via details.
- Content with media, an owner byline, and a status line that updates in place.

## When not to use


- Use [metric-card](/components/metric-card) for numbers.
- Use dialog when the content has no card to grow from.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { Avatar, Card } from "@sagui/ui";

export function ProjectCard() {
  return (
    <Card
      title="Harbour redesign"
      description="New booking flow and room pages."
      media={
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=640&h=320&q=80&auto=format&fit=crop"
          alt="A bright, empty office corridor"
          width={640}
          height={320}
          className="block h-40 w-full object-cover"
        />
      }
      avatar={<Avatar name="Maya Chen" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&q=80&auto=format&fit=crop" size="sm" />}
      meta="Maya Chen"
      status="Updated 2 hours ago"
      details={<p>Scope, milestones, and open questions.</p>}
    />
  );
}
```

## Examples

### Quick look

Pass `details` and the whole card opens and grows into a larger view. Escape or the close control morphs it back to where it was.

<!-- demo: QuickLook -->

### Without media

<!-- demo: Plain -->

### A status that changes

A new status replaces the line: the old one lifts away while the new words rise in one after another.

<!-- demo: ChangingStatus -->


## API reference


### Card

A content card with optional media, byline, and action that can grow into a quick look dialog.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` (required) | `string` | – | Card heading. Becomes the dialog trigger when details is set. |
| `description` | `string` | – | Supporting line under the title. |
| `media` | `ReactNode` | – | Image or visual at the top. Zooms slightly on hover. |
| `action` | `ReactNode` | – | Trailing footer control, such as a button. |
| `avatar` | `ReactNode` | – | Small leading visual in the footer, such as the owner's avatar. |
| `meta` | `ReactNode` | – | Who the card belongs to, shown in the byline. |
| `status` | `string` | – | Short status under the meta, such as "Updated 2 hours ago". Changes roll in word by word and are announced politely. |
| `details` | `ReactNode` | – | Quick look content. When set, the card opens into a larger Radix dialog. |
| `open` | `boolean` | – | Controlled quick look state. |
| `defaultOpen` | `boolean` | `false` | Initial quick look state when uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | – | Called when the quick look opens or closes. |
| `children` | `ReactNode` | – | Extra body content between the description and footer. |
| `className` | `string` | – | Added to the root article. |
| `...props` | `HTMLAttributes<HTMLElement>` | – | Forwarded to the root article. |

## Keyboard interactions


| Keys | Action |
| --- | --- |
| Enter / Space | On the title, opens the quick look when details is set. |
| Escape | Closes the quick look and returns focus to the title. |
| Tab | Stays trapped inside the open quick look. |

## Accessibility


- Renders an article with an h3 title; the quick look uses Radix Dialog with the title and description wired as its label and description.
- Only the title becomes a button, so nested actions stay separately focusable.
- Status changes are read through a role="status" region.
- Give media images alt text or an empty alt when decorative, and an aria-label to icon-only actions.

## Motion


- Hover lifts the card 2px and slowly zooms the media.
- The quick look shares layout ids with the card, so surface, photo, title, and byline travel on one spring; details fade in after.
- Reduced motion drops the lift, zoom, and morph, and the dialog simply fades.

## Responsive behavior


- The card fills its grid cell with min-width 0; the quick look panel is min(30rem, 100vw minus a gutter) wide and capped at the viewport height.
- Hover lift and media zoom run only for a mouse; touch and pen never lift.

## Performance


- The quick look shares layout ids with the card, so the morph animates several elements; the dialog mounts only while open.
- The overlay uses a 7px backdrop blur, which can cost frames on low-end devices over busy pages.

## Notes


- Use for browsable items in a grid: projects, listings, posts. Use metric-card for numbers.
- Add details only when there is real extra content; without it the card is a static article.
- Keep status short and change it in place to get the rolling update.

## Related

- [Dialog](/components/dialog): A focused surface for decisions that need attention.
