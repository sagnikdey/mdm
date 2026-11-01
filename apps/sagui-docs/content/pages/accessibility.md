---
title: Accessibility
description: "The behavior every SagUI component shares."
---

Accessibility is part of how components are built, not a layer on top. This page lists what you can rely on everywhere. Each component page covers the details that are specific to it.

## Native elements first

Components render native buttons, inputs, textareas and links, so roles, activation keys, form submission and autofill work the way people expect. Custom widgets, such as listboxes and spinbuttons, follow the matching WAI-ARIA authoring pattern.

## Names and descriptions

- Every field has a visible label tied to its control.
- Helper and error copy is linked with `aria-describedby`. Errors set `aria-invalid` and are announced as alerts.
- Icon-only controls take their name from a label prop, and show it as a tooltip.

## Keyboard

- Everything that works with a pointer works with the keyboard.
- Composite controls follow roving or arrow key navigation: Tab enters and leaves, arrow keys move inside, Home and End jump to the ends.
- Escape closes anything that opens, and focus returns to what opened it.
- Disabled states that explain themselves, such as a limit on a stepper, use `aria-disabled` so the control stays focusable.

## Focus

Focus is always visible. Buttons and controls draw a 2px ring with an offset. Fields darken their border and add a soft ring. Composite controls such as button groups also move their shared highlight with keyboard focus.

## Announcements

State that changes without moving focus is announced through polite live regions: a copied value, a saved name, the number of results, the country that a pasted phone number picked. Animated text is `aria-hidden` and mirrored in plain text for screen readers.

## Color is never the only signal

Errors have copy, valid states have a check, limits have a note, and disabled controls are dimmed and announced. Color reinforces the state; it does not carry it alone.

## Motion

All motion respects `prefers-reduced-motion`. See [Motion](/docs/motion).

## Touch

Controls are 32 to 48px tall, with larger hit areas where it matters. Press feedback does not rely on hover, and hover styles only apply on devices that have it.

## Testing

Storybook runs the axe accessibility checks on every story. When you build on SagUI, test the whole flow with a keyboard and a screen reader, since a component cannot know what your page means.
