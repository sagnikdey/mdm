import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { AnimationPlaybackControls, Target, TargetAndTransition, Transition } from "motion/react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";
import { Swap } from "../../lib/height-frame";
import { iconKey } from "../../lib/morph";

export type BadgeTone = "neutral" | "success" | "info" | "warning" | "danger";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

const exitFast: Transition = { duration: duration.quick, ease: easeStandard };
const textIn: Target = { opacity: 0, y: "0.3em", filter: `blur(${blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: "-0.3em", filter: `blur(${blur.subtle}px)`, transition: exitFast };
const iconIn: Target = { opacity: 0, scale: 0.6, filter: `blur(${blur.subtle}px)` };
const shown: Target = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" };
const fadeOnly: TargetAndTransition = { opacity: 0, transition: { duration: duration.instant } };

/** Colours come from per-tone custom properties so hover can mix the tone into the surface. */
const tones: Record<BadgeTone, string> = {
  neutral: "[--badge-color:var(--color-muted-foreground)] [--badge-fg:var(--color-muted-foreground)] [--badge-bg:var(--color-muted)] [--badge-border:var(--color-border)]",
  success: "[--badge-color:var(--color-success)] [--badge-fg:var(--color-success)] [--badge-bg:color-mix(in_oklab,var(--color-success)_10%,var(--color-surface))] [--badge-border:color-mix(in_oklab,var(--color-success)_25%,var(--color-border))]",
  info: "[--badge-color:var(--color-primary)] [--badge-fg:var(--color-primary)] [--badge-bg:var(--color-secondary)] [--badge-border:color-mix(in_oklab,var(--color-primary)_24%,var(--color-border))]",
  warning: "[--badge-color:var(--color-warning)] [--badge-fg:var(--color-warning)] [--badge-bg:color-mix(in_oklab,var(--color-warning)_11%,var(--color-surface))] [--badge-border:color-mix(in_oklab,var(--color-warning)_27%,var(--color-border))]",
  danger: "[--badge-color:var(--color-destructive)] [--badge-fg:var(--color-destructive)] [--badge-bg:color-mix(in_oklab,var(--color-destructive)_10%,var(--color-surface))] [--badge-border:color-mix(in_oklab,var(--color-destructive)_26%,var(--color-border))]",
};
const sizes: Record<BadgeSize, string> = {
  sm: "min-h-[22px] px-2 text-[11px]",
  md: "min-h-[26px] px-2.5 text-xs",
};

/** A compact status label. Changing its text or icon crossfades in place while the pill springs to the new width. */
export function Badge({ tone = "neutral", size = "md", icon, className, children, ...props }: BadgeProps) {
  const reduce = useReducedMotion();
  const text = typeof children === "string" || typeof children === "number" ? String(children) : null;
  const glyphKey = icon ? iconKey(icon) : "";
  const body = React.useRef<HTMLSpanElement>(null);
  const content = React.useRef<HTMLSpanElement>(null);
  // Width stays auto at rest. Only a new label or icon springs it from the old size to the new one; passive reflows follow instantly.
  const width = useMotionValue<number | "auto">("auto");
  const changedAt = React.useRef(0);
  React.useLayoutEffect(() => { changedAt.current = performance.now(); }, [text, glyphKey]);
  React.useEffect(() => {
    const node = content.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let last: number | undefined;
    let controls: AnimationPlaybackControls | undefined;
    const settle = () => { width.jump("auto"); if (body.current) body.current.style.width = "auto"; };
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth;
      const current = width.get();
      const from = typeof current === "number" ? current : last;
      last = next;
      controls?.stop();
      if (reduce || from === undefined || from === next || performance.now() - changedAt.current > 120) return settle();
      // Pin the old width before this frame paints, then spring to the new one.
      if (body.current) body.current.style.width = `${from}px`;
      controls = animate(width as never, [from, next], { ...spring.morph, onComplete: settle } as never);
    });
    observer.observe(node);
    return () => { observer.disconnect(); controls?.stop(); };
  }, [width, reduce]);
  const enter: Transition = reduce ? { duration: duration.instant } : { duration: duration.standard, ease: easeEnter };
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center overflow-clip whitespace-nowrap rounded-full border border-[var(--badge-border)] bg-[var(--badge-bg)] font-medium leading-none tracking-[-0.01em] text-[var(--badge-fg)] transition-[border-color,background-color,color] duration-[var(--duration-standard)] ease-out-quint [@media(hover:hover)_and_(pointer:fine)]:hover:border-[color-mix(in_oklab,var(--badge-color)_32%,var(--color-border))] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[color-mix(in_oklab,var(--badge-color)_10%,var(--color-surface))]",
        tones[tone], sizes[size], className
      )}
    >
      <motion.span ref={body} className="block" style={{ width }}>
        <span ref={content} className={cn("relative inline-flex w-max items-center", size === "sm" ? "gap-1" : "gap-[5px]")}>
          {icon ? (
            <span className="relative inline-flex flex-none items-center justify-center leading-none text-[var(--badge-color)]" aria-hidden="true">
              <AnimatePresence mode="popLayout" initial={false}>
                <Swap key={glyphKey} className="relative inline-flex items-center" initial={reduce ? { opacity: 0 } : iconIn} animate={shown} exit={reduce ? fadeOnly : { ...iconIn, transition: exitFast }} transition={(reduce ? enter : spring.snappy) as never}>{icon}</Swap>
              </AnimatePresence>
            </span>
          ) : null}
          {text === null ? children : (
            <span className="relative inline-flex items-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <Swap key={text} className="block" initial={reduce ? { opacity: 0 } : textIn} animate={shown} exit={reduce ? fadeOnly : textOut} transition={enter}>{text}</Swap>
              </AnimatePresence>
            </span>
          )}
        </span>
      </motion.span>
    </span>
  );
}
