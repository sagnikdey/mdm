import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { blur, duration } from "@sagui/tokens/motion";
import { easeEnter, easeStandard } from "./motion";

/** When a title or description changes while open, the new copy rises in and the old copy leaves upward. */
export function SwapText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={text}
        className="block leading-snug"
        initial={reduced ? false : { opacity: 0, y: "0.3em", filter: `blur(${blur.soft}px)` }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.3em", filter: `blur(${blur.subtle}px)`, transition: { duration: duration.quick, ease: easeStandard } }}
        transition={{ duration: duration.standard, ease: easeEnter }}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  );
}

/** A compact icon button used for close controls on overlays: quick press, spring release. */
export const closeButtonClass =
  "grid size-8 flex-none cursor-pointer place-items-center rounded-[var(--radius-md)] border border-border bg-muted/60 text-muted-foreground [transition:background-color_var(--duration-quick)_var(--ease-out-quint),color_var(--duration-quick)_var(--ease-out-quint),transform_var(--duration-spring)_var(--ease-spring)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground active:scale-[.96] active:[transition-duration:var(--duration-quick),var(--duration-quick),var(--duration-instant)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:active:scale-100";
