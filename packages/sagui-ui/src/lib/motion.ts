import type { Target, TargetAndTransition, ValueAnimationTransition } from "motion/react";
import { blur, duration, ease, spring } from "@sagui/tokens/motion";

type Bezier = [number, number, number, number];
const bezier = (curve: readonly number[]) => [...curve] as Bezier;

/** Easing curves as the mutable tuples motion/react expects. */
export const easeStandard = bezier(ease.outQuint);
export const easeEnter = bezier(ease.enter);
export const easeInOut = bezier(ease.inOut);

/** Shared enter and exit states for text and icon crossfades. */
export const rest: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };
export const fadeIn: Target = { opacity: 0, y: 0, scale: 1, filter: "blur(0px)" };
export const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: duration.instant } };
export const glyphIn: Target = { opacity: 0, y: 5, filter: `blur(${blur.soft}px)` };
export const glyphOut: TargetAndTransition = { opacity: 0, y: -4, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.quick, ease: easeStandard } };
export const iconIn: Target = { opacity: 0, scale: 0.6, filter: `blur(${blur.subtle}px)` };
export const iconOut: TargetAndTransition = { ...iconIn, transition: { duration: duration.quick, ease: easeStandard } };
/** Scale rides the spring; opacity and blur tween so blur never overshoots below zero. */
export const iconEnter = {
  ...spring.snappy,
  opacity: { duration: duration.quick, ease: easeEnter },
  filter: { duration: duration.quick, ease: easeEnter },
} as const;

/** A duration spring restated as stiffness and damping, so a retarget mid flight keeps the velocity it already has. */
export const physical = (visualDuration: number, bounce: number): ValueAnimationTransition => {
  const root = (2 * Math.PI) / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 };
};
