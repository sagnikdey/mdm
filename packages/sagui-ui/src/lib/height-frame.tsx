import * as React from "react";
import { animate, motion, useIsPresent, useMotionValue } from "motion/react";
import type { AnimationPlaybackControls, HTMLMotionProps } from "motion/react";
import { spring } from "@sagui/tokens/motion";

/** Outgoing copies are hidden from assistive tech while they fade, so a live region reads only the current text. */
export function Swap(props: HTMLMotionProps<"span">) {
  const present = useIsPresent();
  return <motion.span {...props} aria-hidden={present ? props["aria-hidden"] : true} />;
}

/**
 * Follows its content height. After `morphKey` changes, the height springs from the old size to the new one and then returns
 * to auto, so passive reflows (a resize, a font swap) follow instantly. It clips only while moving, so focus rings stay visible at rest.
 */
export function HeightFrame({ className, contentClassName, reduce, morphKey, children }: { className?: string; contentClassName?: string; reduce: boolean | null; morphKey: string; children: React.ReactNode }) {
  const frame = React.useRef<HTMLDivElement>(null);
  const content = React.useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  const changedAt = React.useRef(0);
  React.useLayoutEffect(() => { changedAt.current = performance.now(); }, [morphKey]);
  React.useEffect(() => {
    const node = content.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let last: number | undefined;
    let controls: AnimationPlaybackControls | undefined;
    const settle = () => { height.jump("auto"); if (frame.current) Object.assign(frame.current.style, { overflow: "", height: "auto" }); };
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight;
      const current = height.get();
      const from = typeof current === "number" ? current : last;
      last = next;
      controls?.stop();
      if (reduce || from === undefined || from === next || performance.now() - changedAt.current > 120) return settle();
      // Pin the old height before this frame paints, then spring to the new one.
      if (frame.current) Object.assign(frame.current.style, { overflow: "hidden", height: `${from}px` });
      controls = animate(height as never, [from, next], { ...spring.smooth, onComplete: settle } as never);
    });
    observer.observe(node);
    return () => { observer.disconnect(); controls?.stop(); };
  }, [height, reduce]);
  return (
    <motion.div ref={frame} className={className} style={{ height }}>
      <div ref={content} className={contentClassName}>{children}</div>
    </motion.div>
  );
}
