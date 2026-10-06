import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { MotionProps, TargetAndTransition, Transition } from "motion/react";
import { Check, CircleX, Info, TriangleAlert, X } from "lucide-react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";
import { HeightFrame, Swap } from "../../lib/height-frame";

export type AlertTone = "info" | "success" | "warning" | "danger";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
  title: string;
  children?: React.ReactNode;
  /** Controls presence. Hiding the alert collapses its height and fades it out. */
  open?: boolean;
  /** Shows a dismiss button. An uncontrolled alert collapses first, then calls this. */
  onDismiss?: () => void;
}
type AlertBoxProps = Omit<AlertProps, "open"> & { reduce: boolean | null; animateIcon?: boolean };

const icons = { info: Info, success: Check, warning: TriangleAlert, danger: CircleX };
const iconColor = { info: "text-primary", success: "text-success", warning: "text-warning", danger: "text-destructive" };
const exitFast: Transition = { duration: duration.quick, ease: easeStandard };
const textIn = { opacity: 0, y: "0.3em", filter: `blur(${blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: "-0.3em", filter: `blur(${blur.subtle}px)`, transition: exitFast };
const iconIn = { opacity: 0, scale: 0.6, filter: `blur(${blur.subtle}px)` };
const shown: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: duration.instant } };

function AlertBox({ tone = "info", title, children, className, reduce, onDismiss, animateIcon = false, ...props }: AlertBoxProps) {
  const Icon = icons[tone];
  const text = typeof children === "string" || typeof children === "number" ? String(children) : null;
  const hasDetails = children !== undefined && children !== null && children !== false && children !== "";
  const enter: Transition = reduce ? { duration: duration.instant } : { duration: duration.standard, ease: easeEnter };
  const swap: MotionProps = { initial: reduce ? { opacity: 0 } : textIn, animate: shown, exit: reduce ? fadeOut : textOut, transition: enter };
  return (
    <div {...props} className={cn("flex items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-resting", className)} role={tone === "danger" ? "alert" : "status"}>
      {/* A new tone morphs its icon in place; a newly shown alert gives the icon a small settle. */}
      <motion.span className={cn("relative mt-px grid size-[18px] flex-none place-items-center", iconColor[tone])} initial={animateIcon && !reduce ? iconIn : false} animate={shown} transition={spring.snappy as never}>
        <AnimatePresence mode="popLayout" initial={false}>
          <Swap key={tone} className="relative grid flex-none place-items-center" initial={reduce ? { opacity: 0 } : iconIn} animate={shown} exit={reduce ? fadeOut : { ...iconIn, transition: exitFast }} transition={reduce ? enter : (spring.snappy as never)}>
            <Icon className="block" width={18} height={18} aria-hidden="true" />
          </Swap>
        </AnimatePresence>
      </motion.span>
      {/* The copy column follows its content height, so longer or shorter messages never snap the alert. */}
      <HeightFrame className="min-w-0 flex-1" contentClassName="relative" reduce={reduce} morphKey={`${title}\n${hasDetails}\n${text ?? ""}`}>
        <strong className="relative block text-sm font-medium leading-snug">
          <AnimatePresence mode="popLayout" initial={false}><Swap key={title} className="block" {...swap}>{title}</Swap></AnimatePresence>
        </strong>
        <AnimatePresence mode="popLayout" initial={false}>
          {hasDetails && (
            <motion.p key="details" className="relative m-0 mt-1 text-xs leading-snug text-muted-foreground" {...swap}>
              {text === null ? children : <AnimatePresence mode="popLayout" initial={false}><Swap key={text} className="block" {...swap}>{text}</Swap></AnimatePresence>}
            </motion.p>
          )}
        </AnimatePresence>
      </HeightFrame>
      {onDismiss && (
        <button
          type="button"
          className="-my-[5px] -mr-1.5 grid size-7 flex-none cursor-pointer place-items-center rounded-full border-0 bg-transparent text-muted-foreground [transition:transform_var(--duration-spring)_var(--ease-spring),background-color_var(--duration-quick)_var(--ease-out-quint),color_var(--duration-quick)_var(--ease-out-quint)] active:scale-[.96] active:[transition-duration:var(--duration-instant)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:active:scale-100"
          aria-label={`Dismiss: ${title}`}
          onClick={onDismiss}
        >
          <X width={16} height={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/** A persistent message that helps people recover or continue. Text changes reword in place and the height follows on a spring. */
export function Alert({ open, onDismiss, ...props }: AlertProps) {
  const reduce = useReducedMotion();
  const [dismissed, setDismissed] = React.useState(false);
  const shell = React.useRef<HTMLDivElement>(null);
  const setClip = (value: string) => { if (shell.current) shell.current.style.overflow = value; };
  if (open === undefined && !onDismiss) return <AlertBox {...props} reduce={reduce} />;
  const isOpen = open ?? !dismissed;
  const dismiss = onDismiss && (() => (open === undefined ? setDismissed(true) : onDismiss()));
  const presence = (reduce ? { duration: 0 } : { height: spring.smooth, opacity: { duration: duration.standard, ease: easeEnter } }) as Transition;
  const exit: TargetAndTransition = { height: 0, opacity: 0, transition: (reduce ? { duration: 0 } : { height: spring.smooth, opacity: exitFast }) as Transition };
  // Presence collapses the height with the fade, so the content below closes the gap instead of jumping.
  return (
    <AnimatePresence initial={false} onExitComplete={() => { if (open === undefined) onDismiss?.(); }}>
      {isOpen && (
        <motion.div key="alert" className="min-w-0" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={exit} transition={presence} ref={shell} onAnimationStart={() => setClip("hidden")} onAnimationComplete={() => setClip("")}>
          <AlertBox {...props} reduce={reduce} onDismiss={dismiss} animateIcon />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
