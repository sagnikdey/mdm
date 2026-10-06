import { blur, duration, ease, spring, stagger } from "@sagui/tokens/motion";

/**
 * SagUI's motion tokens in the shape the ported data and text components read them:
 * `ease.standard` is the out-quint curve, and `duration.fast` is the 160ms step.
 */
export const motionTokens = {
  duration: { instant: duration.instant, fast: duration.quick, exit: 0.18, standard: duration.standard, considered: duration.considered },
  ease: { enter: ease.enter, exit: ease.exit, standard: ease.outQuint, inOut: ease.inOut },
  /** Snappy is restated as a duration spring here, the form these components feed into `animate()` and keyframes. */
  spring: { ...spring, snappy: { type: "spring", visualDuration: 0.26, bounce: 0.12 } },
  stagger,
  blur,
} as const;
