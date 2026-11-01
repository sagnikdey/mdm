import { useReducedMotion } from "motion/react";
import { spring } from "@sagui/tokens/motion";

/** Returns a spring transition, or an instant one when the user prefers reduced motion. */
export function useMotionPreset(name: keyof typeof spring = "snappy") {
  const reduce = useReducedMotion();
  return reduce ? { duration: 0 } : spring[name];
}
