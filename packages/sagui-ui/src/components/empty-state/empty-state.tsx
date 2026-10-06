import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type MotionProps, type TargetAndTransition, type Transition } from "motion/react";
import { Folder } from "lucide-react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";
import { HeightFrame, Swap } from "../../lib/height-frame";
import { iconKey } from "../../lib/morph";

export interface EmptyStateProps {
  title: string;
  description: string;
  /** Buttons or links that offer the next step. */
  action?: React.ReactNode;
  /** A 24px icon. Defaults to a folder. */
  icon?: React.ReactNode;
  className?: string;
  /** Optional accessible label for the state region. */
  label?: string;
}

const exitFast: Transition = { duration: duration.quick, ease: easeStandard };
const textIn = { opacity: 0, y: "0.3em", filter: `blur(${blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: "-0.3em", filter: `blur(${blur.subtle}px)`, transition: exitFast };
const iconIn = { opacity: 0, scale: 0.6, filter: `blur(${blur.subtle}px)` };
const shown: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: duration.instant } };

/** A useful next step when there is nothing to show yet. When the state changes, the icon crossfades and the copy rises in while the old copy leaves. */
export function EmptyState({ title, description, action, icon, className, label }: EmptyStateProps) {
  const reduce = useReducedMotion();
  const glyph = icon ?? <Folder width={24} height={24} strokeWidth={1.5} />;
  const enter: Transition = reduce ? { duration: duration.instant } : { duration: duration.standard, ease: easeEnter };
  const swap: MotionProps = { initial: reduce ? { opacity: 0 } : textIn, animate: shown, exit: reduce ? fadeOut : textOut, transition: enter };
  return (
    <section className={cn("flex w-full flex-col items-center px-5 py-[clamp(2rem,8vw,3rem)] text-center", className)} aria-label={label}>
      {/* The icon settles in once when the state first appears; later changes crossfade in place. */}
      <div className="relative grid size-12 animate-[sg-settle_var(--duration-considered,480ms)_var(--ease-enter)_both] place-items-center rounded-[var(--radius-xl)] border border-border bg-muted text-muted-foreground motion-reduce:animate-none" aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          <Swap key={iconKey(glyph)} className="grid place-items-center" initial={reduce ? { opacity: 0 } : iconIn} animate={shown} exit={reduce ? fadeOut : { ...iconIn, transition: exitFast }} transition={reduce ? enter : (spring.snappy as never)}>{glyph}</Swap>
        </AnimatePresence>
      </div>
      <HeightFrame className="w-full max-w-full" contentClassName="flow-root" reduce={reduce} morphKey={`${title}\n${description}`}>
        <h3 className="relative m-0 mt-5 text-base font-medium leading-snug text-foreground">
          <AnimatePresence mode="popLayout" initial={false}><Swap key={title} className="block [text-wrap:balance]" {...swap}>{title}</Swap></AnimatePresence>
        </h3>
        <p className="relative mx-auto mt-2 mb-0 max-w-72 text-sm leading-snug text-muted-foreground">
          <AnimatePresence mode="popLayout" initial={false}><Swap key={description} className="block [text-wrap:balance]" {...swap}>{description}</Swap></AnimatePresence>
        </p>
      </HeightFrame>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div>}
    </section>
  );
}
