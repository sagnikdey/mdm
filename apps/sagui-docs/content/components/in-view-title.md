---
title: In-view title
slug: in-view-title
description: "Bring a section title in as it scrolls into view."
category: text
component: InViewTitle
keywords:
  - text
  - motion
  - heading
  - react scroll animation title
  - animate on scroll heading
  - in view text animation
  - section title reveal
  - scroll reveal text
  - framer motion heading
---

Bring a section title in as it scrolls into view.

<!-- demo: Hero -->

## When to use


- Section headings that should animate once they scroll into view.
- Feature pages where each section title needs a consistent entrance style.
- Headings that should replay on each entry, via once={false}.

## When not to use


- Use text-reveal for hero copy that animates on load.
- Use scroll-highlight for a paragraph that follows scroll progress.
- Use text-shimmer for status lines, not headings.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage


```tsx
import { InViewTitle } from "@sagui/ui";

export function FeaturesHeader() {
  return (
    <InViewTitle
      variant="line"
      text="Everything your team needs to ship"
      lines={["Everything your team", "needs to ship"]}
    />
  );
}
```

## Examples

### Variants

Five reveal styles. `line` reveals the `lines` you pass one at a time.

<!-- demo: Variants -->


## API reference


### InViewTitle

A section title that reveals itself once it scrolls into view, with five reveal styles.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` (required) | `string` | – | The title copy. |
| `variant` | `"word" \| "line" \| "blur" \| "tracking" \| "wipe"` | `"blur"` | Reveal style. blur suits most headings; word and line rise from a clip; tracking opens letter spacing; wipe uncovers left to right. |
| `as` | `"h1" \| "h2" \| "h3"` | `"h2"` | Heading level. |
| `lines` | `string[]` | – | Explicit line breaks for the line variant. Falls back to one line of text. |
| `once` | `boolean` | `true` | Set false to replay the reveal on every entry. |
| `className` | `string` | – | Merged onto the wrapper. |
| `id` | `string` | – | Forwarded to the heading. |

## Accessibility


- The heading carries aria-label with the full text; the animated parts are aria-hidden.
- Titles already scrolled past show immediately, and server-rendered titles appear on their own if scripts are slow.
- Choose as to match the page's heading outline.

## Motion


- Triggers when 45% of the title is visible. Opacity leads, blur clears next, and the transform settles last, so text is readable before it fully arrives.
- Hiding (with once={false}) is a quick fade with no stagger.
- Reduced motion shows the title instantly with no transform, blur, or mask.

## Responsive behavior


- Word, blur, and tracking variants wrap naturally at any width.
- The line variant uses your explicit lines, which do not rewrap, so keep each line short enough for mobile.

## Performance


- One IntersectionObserver per title via useInView, triggering at 45% visibility.
- Each word or line is a motion span with blur and transform; fine for headings, not for long body text.

## Notes


- Default choice for section headings that should animate on scroll. Use text-reveal for on-load hero copy and scroll-highlight for a key paragraph.
- Pass lines only with variant="line"; the other variants split on words.

## Related

- [Text reveal](/components/text-reveal): Reveal a short piece of content with restrained motion.
- [Text shimmer](/components/text-shimmer): Show ongoing work with a calm light across the words.
