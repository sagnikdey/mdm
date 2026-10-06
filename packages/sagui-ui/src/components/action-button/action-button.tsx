import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type Target, type TargetAndTransition, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard, fadeIn, fadeOut, iconEnter, iconIn, iconOut, rest } from "../../lib/motion";
import { MorphText, useMorphWidth } from "../../lib/morph";

export interface ActionButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart"> {
  /** Idle label and accessible name. */
  label: string;
  successLabel?: string;
  pendingLabel?: string;
  /** Runs on press. The pending state lasts until the promise settles. */
  onAction: () => void | Promise<void>;
  /** Delay before returning to idle after success. 0 keeps the success state. */
  resetAfterMs?: number;
  /** Called when onAction rejects; the button returns to idle. */
  onActionError?: (error: unknown) => void;
}

const pressVariants: Variants = {
  pressed: (button: React.RefObject<HTMLButtonElement | null>) => ({
    scale: (button.current?.offsetWidth ?? 0) > 220 ? 0.985 : 0.97,
    transition: { duration: duration.instant, ease: easeStandard },
  }),
};
/** The arrow leaves in the direction of the action and returns from behind once the button resets. */
const arrowIn: Target = { opacity: 0, x: -6, filter: `blur(${blur.subtle}px)` };
const arrowOut: TargetAndTransition = { opacity: 0, x: 8, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.quick, ease: easeStandard } };
const iconRest: TargetAndTransition = { ...rest, x: 0 };

/** The success tick draws itself from its short stroke, the way a hand would write it. */
function DrawnCheck({ reduced }: { reduced: boolean }) {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <motion.path
        d="M4 12l5 5L20 6"
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { duration: duration.standard, ease: easeEnter, delay: 0.05 }, opacity: { duration: 0.05, delay: 0.05 } }}
      />
    </svg>
  );
}

/** A call-to-action button with a trailing arrow that runs an async action and morphs through pending and success. */
export function ActionButton({ label, successLabel = "Saved", pendingLabel = "Saving", onAction, resetAfterMs = 2400, onActionError, className, disabled, ...props }: ActionButtonProps) {
  const [state, setState] = React.useState<"idle" | "pending" | "success">("idle");
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const rowRef = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion() ?? false;
  const text = state === "pending" ? pendingLabel : state === "success" ? successLabel : label;
  const width = useMorphWidth(rowRef, text, reduced);

  React.useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  async function run() {
    if (state === "pending") return;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setState("pending");
    try {
      await onAction();
      setState("success");
      if (resetAfterMs > 0) resetTimer.current = setTimeout(() => setState("idle"), resetAfterMs);
    } catch (error) {
      setState("idle");
      onActionError?.(error);
    }
  }

  const pending = state === "pending";
  const arrow = state === "idle";

  // Pending stays focusable (aria-disabled instead of disabled), so a keyboard user keeps focus through the whole save.
  return (
    <motion.button
      {...props}
      ref={buttonRef}
      type={props.type ?? "button"}
      className={cn(
        "relative inline-flex h-10 items-center justify-center overflow-hidden px-4 select-none cursor-pointer",
        "rounded-[var(--radius-md)] border border-primary bg-primary text-primary-foreground text-sm font-medium",
        "transition-[box-shadow,opacity] duration-[var(--duration-quick)]",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:enabled:shadow-resting",
        "disabled:cursor-not-allowed disabled:opacity-70 data-[state=pending]:cursor-progress",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      disabled={disabled}
      aria-disabled={pending ? true : props["aria-disabled"]}
      aria-busy={pending}
      data-state={state}
      onClick={run}
      custom={buttonRef}
      variants={pressVariants}
      whileTap={reduced || disabled || pending ? undefined : "pressed"}
      transition={spring.snappy}
    >
      <span className="inline-flex min-h-5 items-center justify-center gap-2 whitespace-nowrap" aria-hidden="true">
        {/* The width follows the label on a spring; the slot clips only while it morphs. */}
        <motion.span className="inline-flex min-w-0 data-[morphing]:[clip-path:inset(-.6em_0_-.6em_-.3em)]" style={{ width }}>
          <span ref={rowRef} className="relative inline-flex flex-none">
            <MorphText text={text} reduced={reduced} />
          </span>
        </motion.span>
        <span className="grid size-[17px] flex-[0_0_17px] place-items-center">
          <AnimatePresence initial={false}>
            <motion.span
              key={state}
              className="col-start-1 row-start-1 grid size-[17px] place-items-center"
              initial={reduced ? fadeIn : arrow ? arrowIn : iconIn}
              animate={iconRest}
              exit={reduced ? fadeOut : arrow ? arrowOut : iconOut}
              transition={reduced ? { duration: duration.instant } : iconEnter}
            >
              {pending ? (
                <span className="inline-block size-4 rounded-full border-[1.5px] border-current border-r-transparent animate-[sg-spin_.7s_linear_infinite] motion-reduce:animate-none" />
              ) : state === "success" ? (
                <DrawnCheck reduced={reduced} />
              ) : (
                <ArrowRight className="flex-none" width={17} height={17} />
              )}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
      <span className="sr-only">{label}</span>
      <span className="sr-only" role="status">{pending ? pendingLabel : state === "success" ? successLabel : ""}</span>
    </motion.button>
  );
}
