import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type Target, type TargetAndTransition, type Transition } from "motion/react";
import { CircleAlert, Copy } from "lucide-react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard, fadeIn, fadeOut, rest } from "../../lib/motion";
import { MorphText } from "../../lib/morph";
import { useCopyFeedback } from "../../lib/use-copy-feedback";

export interface CopyButtonProps {
  /** The text written to the clipboard. */
  value: string;
  /** Idle label and accessible name. */
  label?: string;
  className?: string;
  /** Shows only the icon; the label stays the accessible name. */
  iconOnly?: boolean;
  variant?: "outline" | "plain";
  disabled?: boolean;
  onCopied?: () => void;
}

/* Copy feedback is deliberately unhurried: a slow, almost critically damped spring and long, soft crossfades read as calm.
   The same motion plays in reverse when the confirmation hands back to idle, so nothing ever snaps. */
const settle = spring.settle;
const enter = { duration: 0.36, ease: easeEnter } as const;
const instant = { duration: duration.instant } as const;
const soft = `blur(${blur.soft}px)`;
const iconIn: Target = { opacity: 0, scale: 0.6, filter: soft };
const iconOut: TargetAndTransition = { opacity: 0, scale: 0.6, filter: soft, transition: { duration: 0.24, ease: easeStandard } };
const iconEnter: Transition = { scale: settle, opacity: { ...enter, delay: 0.03 }, filter: { ...enter, delay: 0.03 } };

/** The success tick draws itself from its short stroke, the way a hand would write it. */
function DrawnCheck({ reduced }: { reduced: boolean }) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <motion.path
        d="M4 12l5 5L20 6"
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { duration: 0.5, ease: easeStandard, delay: 0.05 }, opacity: { duration: 0.01, delay: 0.05 } }}
      />
    </svg>
  );
}

export function CopyButton({ value, label = "Copy", className, iconOnly = false, variant = "outline", disabled, onCopied }: CopyButtonProps) {
  const { state, copy } = useCopyFeedback();
  const reduced = useReducedMotion() ?? false;
  const text = state === "copied" ? "Copied" : state === "error" ? "Failed" : label;

  async function handleCopy() {
    if (await copy(value)) onCopied?.();
  }

  return (
    <>
      <button
        type="button"
        className={cn(
          "inline-flex w-max max-w-full h-8 items-center justify-center gap-2 px-3 cursor-pointer select-none",
          "rounded-[var(--radius-md)] border text-sm font-medium text-foreground",
          "[transition:background-color_var(--duration-quick)_var(--ease-out-quint),border-color_var(--duration-quick)_var(--ease-out-quint),transform_var(--duration-spring)_var(--ease-spring)]",
          "active:enabled:scale-[.97] active:enabled:[transition-duration:var(--duration-quick),var(--duration-quick),var(--duration-fast)]",
          "disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:enabled:scale-100",
          variant === "plain"
            ? "border-transparent bg-transparent text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:enabled:bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:enabled:text-foreground"
            : "border-border bg-surface [@media(hover:hover)_and_(pointer:fine)]:hover:enabled:bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:enabled:border-border-strong",
          iconOnly && "w-8 px-0 active:enabled:scale-[.96]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
        onClick={() => void handleCopy()}
        aria-label={label}
        data-copy-state={state}
        disabled={disabled}
      >
        <span className="relative grid size-4 flex-none" aria-hidden="true">
          <AnimatePresence initial={false}>
            <motion.span
              key={state}
              className={cn("absolute inset-0 grid place-items-center", state === "copied" && "text-success", state === "error" && "text-destructive")}
              initial={reduced ? fadeIn : iconIn}
              animate={rest}
              exit={reduced ? fadeOut : iconOut}
              transition={reduced ? instant : iconEnter}
            >
              {state === "copied" ? <DrawnCheck reduced={reduced} /> : state === "error" ? <CircleAlert size={16} strokeWidth={1.75} /> : <Copy size={16} strokeWidth={1.75} />}
            </motion.span>
          </AnimatePresence>
        </span>
        {!iconOnly && (
          // The label cell reserves its widest state, so the row never changes width while the letters move.
          <span className="-mx-1 grid min-w-0 overflow-x-clip px-1 text-left whitespace-nowrap" aria-hidden="true">
            {[label, "Copied", "Failed"].map((word) => <span key={word} className="invisible [grid-area:1/1]">{word}</span>)}
            <span className="[grid-area:1/1] justify-self-start">
              <MorphText text={text} reduced={reduced} calm layoutRoot />
            </span>
          </span>
        )}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "idle" ? "" : state === "error" ? `${label}: Could not copy` : `${label}: Copied`}
      </span>
    </>
  );
}
