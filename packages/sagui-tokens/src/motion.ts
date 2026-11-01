/** Motion presets shared by all SagUI components (for motion/react). */
export const spring = {
  snappy: { type: "spring", stiffness: 520, damping: 34, mass: 0.8 },
  gentle: { type: "spring", stiffness: 260, damping: 28 },
  bouncy: { type: "spring", stiffness: 400, damping: 18 },
  /** Shape morphs, shared highlights, and widths that follow new content. */
  morph: { type: "spring", visualDuration: 0.42, bounce: 0.16 },
  /** Panels and layout shifts. Critically damped, never overshoots. */
  smooth: { type: "spring", visualDuration: 0.4, bounce: 0 },
  /** Calm confirmations such as copy feedback. */
  settle: { type: "spring", visualDuration: 0.5, bounce: 0.06 },
} as const;

export const duration = {
  fast: 0.12, base: 0.2, slow: 0.36,
  instant: 0.12, quick: 0.16, standard: 0.24, considered: 0.48,
} as const;

export const ease = {
  outQuint: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  enter: [0.16, 1, 0.3, 1],
  exit: [0.7, 0, 0.84, 0],
} as const;

/** Stagger steps in seconds. Keep total stagger under roughly 0.4s. */
export const stagger = { char: 0.016, word: 0.04, line: 0.08, item: 0.035 } as const;

/** Blur radii in px for text and content crossfades. Keep blur small and brief. */
export const blur = { subtle: 2, soft: 4, text: 8 } as const;
