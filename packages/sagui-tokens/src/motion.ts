/** Motion presets shared by all SagUI components (for motion/react). */
export const spring = {
  snappy: { type: "spring", stiffness: 520, damping: 34, mass: 0.8 },
  gentle: { type: "spring", stiffness: 260, damping: 28 },
  bouncy: { type: "spring", stiffness: 400, damping: 18 },
} as const;

export const duration = { fast: 0.12, base: 0.2, slow: 0.36 } as const;
export const ease = { outQuint: [0.22, 1, 0.36, 1], inOut: [0.65, 0, 0.35, 1] } as const;
