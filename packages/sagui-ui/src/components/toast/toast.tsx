import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { MotionProps, PanInfo, TargetAndTransition, Transition, Variants } from "motion/react";
import { X } from "lucide-react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";
import { HeightFrame, Swap } from "../../lib/height-frame";

export interface ToastProps {
  title: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Milliseconds before it closes itself. 0 keeps it open. Needs `onOpenChange`. */
  duration?: number;
  className?: string;
}

const subscribeHydration = () => () => {};
const exitFast: Transition = { duration: duration.quick, ease: easeStandard };
const enter: Transition = { duration: duration.standard, ease: easeEnter };
const textIn = { opacity: 0, y: "0.3em", filter: `blur(${blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: "-0.3em", filter: `blur(${blur.subtle}px)`, transition: exitFast };
const textShown: TargetAndTransition = { opacity: 1, y: "0em", filter: "blur(0px)" };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: duration.instant } };
/** A swipe past this distance (px) or speed (px/s) dismisses the toast in the direction it was thrown. */
const swipe = { distance: 80, velocity: 480 };

/** Brief confirmation for a completed background action. Swipe sideways to throw it away; hover is not required. */
export function Toast({ title, description, open = true, onOpenChange, duration: timeout = 4500, className }: ToastProps) {
  const reduce = useReducedMotion();
  // Toasts that mount after hydration rise in from their edge; server-rendered ones start settled.
  const hydrated = React.useSyncExternalStore(subscribeHydration, () => true, () => false);
  const [enterOnMount] = React.useState(hydrated);
  const [dismissed, setDismissed] = React.useState(false);
  const [throwX, setThrowX] = React.useState(0);
  const [lastOpen, setLastOpen] = React.useState(open);
  if (open !== lastOpen) { setLastOpen(open); if (open) { setDismissed(false); setThrowX(0); } }
  const visible = open && !dismissed;
  const surface = React.useRef<HTMLDivElement>(null);
  // The drag offset is owned here, so a release hands its velocity straight to the spring home or to the throw.
  const x = useMotionValue(0);
  const releaseVelocity = React.useRef(0);

  /** Closing tells the parent at once, while the exit plays out here, so a new toast can be raised mid-exit and simply turns back. */
  function dismiss(to: number) {
    setThrowX(to);
    setDismissed(true);
    onOpenChange?.(false);
  }

  React.useEffect(() => {
    if (!visible || !onOpenChange || timeout <= 0) return;
    const timer = window.setTimeout(() => { setThrowX(0); setDismissed(true); onOpenChange(false); }, timeout);
    return () => window.clearTimeout(timer);
  }, [visible, onOpenChange, timeout]);

  function handleDragEnd(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    const direction = Math.sign(info.offset.x || info.velocity.x);
    // A short swipe springs back with its release velocity and a slight settle instead of drifting home.
    if (Math.abs(info.offset.x) < swipe.distance && Math.abs(info.velocity.x) < swipe.velocity) {
      animate(x, 0, { ...spring.snappy, velocity: info.velocity.x } as never);
      return;
    }
    releaseVelocity.current = info.velocity.x;
    dismiss(direction * ((surface.current?.offsetWidth ?? 320) + 48));
  }

  const variants: Variants = reduce
    ? { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: duration.instant } }, exit: fadeOut }
    : {
        // x resets here because the drag value outlives a thrown toast; the next one must rise from the center.
        hidden: { opacity: 0, x: 0, y: 16, scale: 0.96 },
        shown: { opacity: 1, x: 0, y: 0, scale: 1, transition: { ...spring.morph, opacity: enter } as never },
        // A thrown toast keeps its release velocity; a closed one sinks back toward the edge it came from.
        exit: (to: number) => to
          ? { x: to, opacity: 0, transition: { x: { type: "spring", visualDuration: 0.3, bounce: 0, velocity: releaseVelocity.current, restDelta: 2, restSpeed: 40 }, opacity: { duration: 0.18 } } as never }
          : { opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.18, ease: easeStandard } },
      };
  const swap: MotionProps = { initial: reduce ? { opacity: 0 } : textIn, animate: textShown, exit: reduce ? fadeOut : textOut, transition: reduce ? { duration: duration.instant } : enter };

  return (
    <AnimatePresence initial={enterOnMount} custom={throwX}>
      {visible && (
        <motion.div
          key="toast"
          ref={surface}
          className={cn("flex w-[min(100%,26rem)] min-w-0 items-start gap-3 rounded-[var(--radius-xl)] border border-border bg-surface py-3.5 pr-3.5 pl-4 tracking-[-0.01em] text-foreground shadow-floating", className)}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          custom={throwX}
          variants={variants}
          initial="hidden"
          animate="shown"
          exit="exit"
          style={{ x }}
          // Drag writes touch-action into the markup, so the reduced motion switch waits for hydration to keep server and client in step.
          drag={reduce && hydrated ? false : "x"}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          <span className="grid size-[30px] flex-none place-items-center rounded-full border border-[color-mix(in_oklab,var(--color-success)_24%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-success)_10%,var(--color-surface))] text-success" aria-hidden="true">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
              <motion.path d="M4 12.5l5 5L20 6.5" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: duration.standard, ease: easeEnter, delay: 0.12 }} />
            </svg>
          </span>
          {/* The copy column follows its content height, so a longer message grows the toast instead of snapping it. */}
          <HeightFrame className="block min-w-0 flex-1" contentClassName="relative grid min-w-0 gap-0.5 pt-[5px]" reduce={reduce} morphKey={`${title}\n${description ?? ""}`}>
            <strong className="relative block min-w-0 text-sm font-medium leading-snug">
              <AnimatePresence mode="popLayout" initial={false}><Swap key={title} className="block truncate" {...swap}>{title}</Swap></AnimatePresence>
            </strong>
            <AnimatePresence mode="popLayout" initial={false}>
              {description ? <Swap key={description} className="block text-sm leading-snug text-muted-foreground" {...swap}>{description}</Swap> : null}
            </AnimatePresence>
          </HeightFrame>
          <button
            className="-mt-px -mr-0.5 grid size-8 flex-none cursor-pointer place-items-center rounded-full border-0 bg-transparent text-muted-foreground [transition:transform_var(--duration-spring)_var(--ease-spring),background-color_var(--duration-quick)_var(--ease-out-quint),color_var(--duration-quick)_var(--ease-out-quint)] active:scale-[.96] active:[transition-duration:var(--duration-instant)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:active:scale-100"
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dismiss(0)}
          >
            <X width={16} height={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
