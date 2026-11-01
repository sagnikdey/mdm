---
title: Motion
description: "How motion is built into every component, and how reduced motion is handled."
---

Motion in SagUI is there to explain what changed, not to decorate. Layout never jumps: widths follow content on springs, labels crossfade in place, and anything that appears or leaves does so from where it belongs.

## Principles

- **Nothing around a control moves unless it has to.** Buttons reserve room for their widest label, messages open their row from a true zero height, and a growing number adds a column instead of shoving its neighbours.
- **Direction carries meaning.** A number that grows rolls up and one that shrinks rolls down. A forward step arrives from the right and a step back from the left.
- **Presses answer fast, releases settle slowly.** A press is quick (about 100ms); the release springs back.
- **Blur is small and brief.** Crossfades use a 2 to 4px blur so changing text and icons read as one object morphing.
- **Springs, not timelines.** Interruptible springs retarget mid flight, so quick repeated input never queues up.

## Presets

The presets live in `@sagui/tokens/motion` and are used with `motion/react`.

| Spring | Use |
| --- | --- |
| `snappy` | Presses, toggles, small indicators. |
| `gentle` | Gentle layout changes. |
| `bouncy` | Playful emphasis. |
| `morph` | Shape morphs, shared highlights, and widths that follow new content. |
| `smooth` | Panels and height changes. Critically damped, never overshoots. |
| `settle` | Calm confirmations such as copy feedback. |

| Duration | Seconds |
| --- | --- |
| `instant` | 0.12 |
| `quick` | 0.16 |
| `standard` | 0.24 |
| `considered` | 0.48 |

Easings `outQuint`, `inOut`, `enter` and `exit` are exported as cubic-bezier tuples, along with `stagger` and `blur` steps.

```tsx
import { motion } from "motion/react";
import { spring } from "@sagui/tokens/motion";

<motion.div layout transition={spring.morph} />;
```

## useMotionPreset

`useMotionPreset` from `@sagui/ui` returns a spring, or an instant transition when the person prefers reduced motion.

```tsx
import { useMotionPreset } from "@sagui/ui";

const transition = useMotionPreset("snappy");
```

## Reduced motion

Every component honours `prefers-reduced-motion`:

- Travel, scale and blur are removed. Content changes with a short fade or at once.
- Press scales, width springs and layout glides are removed.
- Spinners and drawn checks stay, since they carry state, but they do not move through space.
- The CSS duration tokens become 0.

Components read the preference after hydration, so the server and first client render always agree.

## Writing your own

- Animate with `transform`, `opacity` and `filter`, not with layout properties, where you can.
- Reuse the springs above so your motion feels like the rest of the system.
- Check your work with reduced motion on. The result should still be clear.
