import * as React from "react";
import { useReducedMotion } from "motion/react";

const subscribe = () => () => {};

/** Reduced motion only counts after hydration, so the server and the first client render always agree. */
export function useReducedFlag() {
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}
