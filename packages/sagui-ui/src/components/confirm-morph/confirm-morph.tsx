import * as React from "react";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion } from "motion/react";
import type { AnimationPlaybackControls, MotionValue, ValueAnimationTransition, Variants } from "motion/react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { blur } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";

/** Where the control is in its life: resting, asking, working, finished, or failed. */
export type ConfirmMorphState = "idle" | "confirming" | "pending" | "done" | "error";

/**
 * A button for destructive or important actions that asks in place. Pressing it morphs the same surface into an inline
 * question with Cancel and Confirm, then into a spinner, then into a result with Undo. The width springs to each face, so
 * nothing around it jumps. Escape, an outside press, or the timeout all return it to rest.
 * Use it where a modal dialog would be heavy: deleting a selection, revoking access, discarding a draft.
 */
export interface ConfirmMorphProps {
  /** The resting label, such as "Delete". */
  label: React.ReactNode;
  /** A plain icon before the resting label. */
  icon?: React.ReactNode;
  /** The question shown while confirming, such as "Delete 3 files?". Defaults to the label with a question mark. */
  prompt?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Shown beside the spinner while `onConfirm` resolves. */
  pendingLabel?: string;
  doneLabel?: string;
  errorLabel?: string;
  retryLabel?: string;
  undoLabel?: string;
  /** Shown beside the spinner while `onUndo` resolves. */
  undoingLabel?: string;
  /** `danger` colours the resting label red and gives the pill a faint red edge; `neutral` keeps it on the foreground for important, reversible actions. */
  tone?: "danger" | "neutral";
  /** Runs on confirm. Return a promise to show the pending face; a rejection shows the error face with Retry. */
  onConfirm?: () => void | Promise<unknown>;
  /** Offering it adds Undo to the result. Return a promise to show a pending face while it runs. */
  onUndo?: () => void | Promise<unknown>;
  onCancel?: () => void;
  /** Controlled state. Pair it with `onStateChange`. */
  state?: ConfirmMorphState;
  /** Starting state when uncontrolled. */
  defaultState?: ConfirmMorphState;
  onStateChange?: (state: ConfirmMorphState) => void;
  /** Milliseconds before an unanswered question returns to rest. Resting the pointer on the control pauses it. 0 turns it off. */
  confirmTimeout?: number;
  /** Milliseconds a result stays before returning to rest. Resting the pointer on the control pauses it. 0 turns it off. */
  resultTimeout?: number;
  /** A press outside the control cancels an open question. Defaults to true. */
  cancelOnOutsidePress?: boolean;
  disabled?: boolean;
  className?: string;
  /** Receives the root element, which also takes focus while the action is pending. */
  ref?: React.Ref<HTMLDivElement>;
}

const TRAVEL = 12;
/** Duration springs restated as stiffness and damping so a retarget keeps the velocity already in flight. */
const physical = (visualDuration: number, bounce: number): ValueAnimationTransition => {
  const root = (2 * Math.PI) / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 };
};
const GROW = physical(0.44, 0.18), SHRINK = physical(0.34, 0), SLIDE = physical(0.36, 0.06);

const subscribe = () => () => {};
function useReducedFlag() {
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

/** Forward steps arrive from the right, backward steps from the left; the old face leaves the other way, blurred, so the eye reads one morph. */
const faceVariants: Variants = {
  hidden: (direction: number) => ({ opacity: 0, x: direction * TRAVEL, filter: `blur(${blur.soft}px)` }),
  shown: { opacity: 1, x: 0, filter: "blur(0px)", transition: { x: SLIDE, opacity: { duration: 0.2, ease: easeEnter, delay: 0.04 }, filter: { duration: 0.22, ease: easeEnter, delay: 0.04 } } },
  gone: (direction: number) => ({ opacity: 0, x: direction * -TRAVEL * 0.6, filter: `blur(${blur.soft}px)`, transition: { x: SLIDE, opacity: { duration: 0.12, ease: easeStandard }, filter: { duration: 0.12, ease: easeStandard } } }),
};
const fadeVariants: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.14 } }, gone: { opacity: 0, transition: { duration: 0.1 } } };

function Face({ id, direction, reduced, onSize, children, labelledBy }: { id: ConfirmMorphState; direction: number; reduced: boolean; onSize: (id: ConfirmMorphState, width: number) => void; children: React.ReactNode; labelledBy?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const present = useIsPresent();
  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !present) return;
    // Measure the natural width, not the width a tight container squeezes the face to, so squeezing never feeds back into the spring.
    const report = () => {
      const flex = node.style.flex;
      node.style.flex = "none";
      const width = node.offsetWidth;
      node.style.flex = flex;
      onSize(id, width);
    };
    report();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(report);
    observer.observe(node);
    return () => observer.disconnect();
  }, [id, onSize, present]);
  return (
    <motion.div
      ref={ref}
      // A leaving face steps out of the flow and stays centred while the surface springs to the next one.
      className="flex h-full min-w-0 flex-[0_1_auto] items-center gap-0.5 px-1 whitespace-nowrap will-change-[transform,filter] data-[face=idle]:rounded-full data-[face=idle]:p-0 inert:pointer-events-none inert:absolute inert:top-0 inert:left-1/2 inert:-translate-x-1/2"
      data-face={id}
      custom={direction}
      role={labelledBy ? "group" : undefined}
      aria-labelledby={labelledBy}
      variants={reduced ? fadeVariants : faceVariants}
      initial="hidden"
      animate="shown"
      exit="gone"
      inert={!present || undefined}
    >
      {children}
    </motion.div>
  );
}

/** A success disc that pops in with a tick drawing across it, the moment the action lands. */
function Check({ reduced }: { reduced: boolean }) {
  return (
    <svg className="size-[18px]" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <motion.circle
        className="fill-success"
        cx="9" cy="9" r="8"
        style={{ transformOrigin: "9px 9px" }}
        initial={reduced ? false : { scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ scale: physical(0.34, 0.3), opacity: { duration: 0.12 } }}
      />
      <motion.path
        className="stroke-background"
        d="M5.6 9.3 7.8 11.4 12.4 6.7"
        strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.28, ease: easeEnter, delay: 0.12 }}
      />
    </svg>
  );
}

const hoverable = "[@media(hover:hover)_and_(pointer:fine)]:hover";
const actionButton = [
  "inline-flex h-8 flex-none items-center px-[11px] border-0 rounded-full cursor-pointer font-[inherit] font-medium",
  "[transition:background-color_var(--duration-quick)_var(--ease-out-quint),color_var(--duration-quick)_var(--ease-out-quint),transform_var(--duration-spring)_var(--ease-spring)]",
  "active:scale-95 active:[transition-duration:var(--duration-quick),var(--duration-quick),90ms]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
  "motion-reduce:transition-none motion-reduce:active:scale-100",
].join(" ");
const secondaryButton = (strong: boolean) => cn(
  actionButton,
  "bg-transparent",
  strong ? "text-foreground" : "text-muted-foreground",
  `${hoverable}:bg-[color:color-mix(in_oklab,var(--color-foreground)_7%,transparent)] ${hoverable}:text-foreground`
);
const primaryButton = cn(actionButton, "bg-primary text-primary-foreground", `${hoverable}:bg-primary/90`);

export function ConfirmMorph({
  label, icon, prompt, confirmLabel = "Delete", cancelLabel = "Cancel", pendingLabel = "Deleting", doneLabel = "Deleted", errorLabel = "Couldn’t finish",
  retryLabel = "Retry", undoLabel = "Undo", undoingLabel = "Restoring", tone = "danger", onConfirm, onUndo, onCancel,
  state: stateProp, defaultState = "idle", onStateChange, confirmTimeout = 6000, resultTimeout = 5000, cancelOnOutsidePress = true, disabled = false, className, ref,
}: ConfirmMorphProps) {
  const reduced = useReducedFlag();
  const uid = React.useId();
  const promptId = `${uid}-prompt`;
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

  const [inner, setInner] = React.useState<ConfirmMorphState>(defaultState);
  const state = stateProp ?? inner;
  const [direction, setDirection] = React.useState(1);
  const [working, setWorking] = React.useState<"confirm" | "undo">("confirm");
  const [announcement, setAnnouncement] = React.useState("");

  const live = React.useRef({ state, onStateChange, controlled: stateProp !== undefined });
  React.useLayoutEffect(() => { live.current = { state, onStateChange, controlled: stateProp !== undefined }; });
  const pendingFocus = React.useRef(false);
  const run = React.useRef(0);

  const go = React.useCallback((next: ConfirmMorphState) => {
    const current = live.current.state;
    if (next === current) return;
    const root = rootRef.current;
    // Focus follows the control between faces, but only when it was already inside; a timeout never steals focus from elsewhere.
    pendingFocus.current = !!root && (root.contains(document.activeElement) || document.activeElement === document.body);
    // Every step moves forward except the return to rest, which comes back from the left.
    setDirection(next === "idle" ? -1 : 1);
    if (!live.current.controlled) setInner(next);
    live.current.state = next;
    live.current.onStateChange?.(next);
  }, []);

  const toIdle = React.useCallback(() => { run.current++; go("idle"); }, [go]);

  const perform = React.useCallback(async (kind: "confirm" | "undo") => {
    const handler = kind === "confirm" ? onConfirm : onUndo;
    const token = ++run.current;
    setWorking(kind);
    let result: void | Promise<unknown> | undefined;
    try { result = handler?.(); }
    catch { go("error"); setAnnouncement(errorLabel); return; }
    if (result && typeof (result as Promise<unknown>).then === "function") {
      go("pending");
      setAnnouncement(kind === "confirm" ? pendingLabel : undoingLabel);
      try { await result; }
      catch {
        if (token !== run.current) return;
        go("error");
        setAnnouncement(errorLabel);
        return;
      }
      if (token !== run.current) return;
    }
    if (kind === "undo") { go("idle"); setAnnouncement("Undone"); return; }
    go("done");
    setAnnouncement(onUndo ? `${doneLabel}. ${undoLabel} is available.` : doneLabel);
  }, [doneLabel, errorLabel, go, onConfirm, onUndo, pendingLabel, undoLabel, undoingLabel]);

  const cancel = React.useCallback(() => { onCancel?.(); toIdle(); setAnnouncement("Cancelled"); }, [onCancel, toIdle]);
  const expire = React.useRef(() => {});
  React.useLayoutEffect(() => { expire.current = () => { if (live.current.state === "confirming") cancel(); else toIdle(); }; });

  /* The shape: one surface whose width springs to whichever face is current. At rest it is auto, so it renders right before hydration. */
  const width = useMotionValue<number | "auto">("auto");
  const target = React.useRef(0);
  const flight = React.useRef(0);
  const onFaceSize = React.useCallback((id: ConfirmMorphState, w: number) => {
    if (id !== live.current.state || Math.abs(w - target.current) < 0.5) return;
    const from = target.current;
    target.current = w;
    if (!from || reduced) { width.jump("auto"); return; }
    if (width.get() === "auto") width.jump(from);
    const token = ++flight.current;
    animate(width as MotionValue<number>, w, w > from ? GROW : SHRINK).then(() => { if (token === flight.current) width.jump("auto"); });
  }, [reduced, width]);

  /* The timeout runs as an invisible clock. A pointer resting on the control holds it, and so does a hidden tab. */
  const drain = useMotionValue(1);
  const clock = React.useRef<AnimationPlaybackControls | null>(null);
  const holds = React.useRef({ hover: false, hidden: false });
  const timeout = state === "confirming" ? confirmTimeout : state === "done" || state === "error" ? resultTimeout : 0;
  const sync = React.useCallback(() => {
    const control = clock.current;
    if (!control) return;
    const held = holds.current.hover || holds.current.hidden;
    if (held) control.pause(); else control.play();
  }, []);
  React.useEffect(() => {
    if (!timeout) return;
    drain.jump(1);
    const control = animate(drain, 0, { duration: timeout / 1000, ease: "linear" });
    clock.current = control;
    control.then(() => { if (clock.current === control) { clock.current = null; expire.current(); } });
    sync();
    return () => { if (clock.current === control) clock.current = null; control.stop(); };
  }, [drain, state, sync, timeout]);
  React.useEffect(() => {
    const onVisibility = () => { holds.current.hidden = document.hidden; sync(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [sync]);

  // An outside press answers the question with no.
  React.useEffect(() => {
    if (state !== "confirming" || !cancelOnOutsidePress) return;
    const down = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) cancel(); };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [cancel, cancelOnOutsidePress, state]);

  // Focus lands on the safe choice: Cancel while asking, Undo or Retry on a result, the root while working, the trigger at rest.
  React.useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const root = rootRef.current;
    if (!root) return;
    const face = root.querySelector<HTMLElement>(`[data-face="${state}"]`);
    const autofocus = face?.querySelector<HTMLElement>("[data-autofocus]:not(:disabled)");
    (autofocus ?? root).focus({ preventScroll: true });
  }, [state]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    if (state === "confirming") { event.preventDefault(); event.stopPropagation(); cancel(); }
    else if (state === "done" || state === "error") { event.preventDefault(); event.stopPropagation(); toIdle(); }
  };

  const danger = tone === "danger";
  const shownPrompt = prompt ?? <>{label}?</>;
  const face = (() => {
    switch (state) {
      case "confirming": return (
        <>
          <span id={promptId} className="min-w-[3ch] max-w-64 flex-[0_1_auto] overflow-hidden pr-1.5 pl-[11px] text-foreground font-medium tabular-nums leading-[1.3] text-ellipsis">{shownPrompt}</span>
          <button type="button" className={secondaryButton(false)} data-autofocus onClick={cancel}>{cancelLabel}</button>
          <button type="button" className={primaryButton} onClick={() => void perform("confirm")}>{confirmLabel}</button>
        </>
      );
      case "pending": return (
        <span className="inline-flex items-center gap-[7px] pr-4 pl-3.5 font-medium text-muted-foreground tabular-nums">
          <LoaderCircle className="flex-none animate-[sg-spin_.7s_linear_infinite] motion-reduce:animate-[sg-spin_1.6s_linear_infinite]" size={16} strokeWidth={1.75} aria-hidden="true" />
          <span>{working === "undo" ? undoingLabel : pendingLabel}</span>
        </span>
      );
      case "done": return (
        <>
          <span className={cn("inline-flex items-center gap-[7px] pl-2.5 pr-2 font-medium text-foreground tabular-nums", !onUndo && "pr-3")}>
            <Check reduced={reduced} /><span className="leading-[1.3]">{doneLabel}</span>
          </span>
          {onUndo && <button type="button" className={secondaryButton(true)} data-autofocus onClick={() => void perform("undo")}>{undoLabel}</button>}
        </>
      );
      case "error": return (
        <>
          <span className="inline-flex items-center gap-[7px] pl-2.5 pr-2 font-medium text-foreground tabular-nums">
            <CircleAlert className="flex-none text-destructive" size={16} strokeWidth={1.75} aria-hidden="true" /><span className="leading-[1.3]">{errorLabel}</span>
          </span>
          <button type="button" className={secondaryButton(true)} data-autofocus onClick={() => void perform(working)}>{retryLabel}</button>
        </>
      );
      default: return (
        <button
          type="button"
          data-trigger=""
          data-autofocus
          disabled={disabled}
          className={cn(
            "inline-flex h-full items-center gap-2 pr-[15px] pl-[13px] border-0 rounded-[inherit] bg-transparent cursor-pointer font-[inherit] font-medium",
            "transition-colors duration-[var(--duration-quick)] ease-[var(--ease-out-quint)]",
            "disabled:cursor-not-allowed disabled:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            danger
              ? `text-destructive ${hoverable}:enabled:bg-[color:color-mix(in_oklab,var(--color-destructive)_8%,transparent)]`
              : `text-foreground ${hoverable}:enabled:bg-[color:color-mix(in_oklab,var(--color-foreground)_5%,transparent)]`
          )}
          onClick={() => { setAnnouncement(typeof shownPrompt === "string" ? shownPrompt : ""); go("confirming"); }}
        >
          {icon && <span className="grid size-4 place-items-center [&>svg]:size-4" aria-hidden="true">{icon}</span>}
          <span>{label}</span>
        </button>
      );
    }
  })();

  // One pill for every state. The border is an overlay so it never changes a measurement. Danger stays quiet: red text and a faint red edge on a neutral pill.
  const surfaceTone = disabled && state === "idle"
    ? "shadow-none after:border-[color:color-mix(in_oklab,var(--color-border)_60%,transparent)]"
    : danger && (state === "idle" || state === "error")
      ? "bg-[color:color-mix(in_oklab,var(--color-destructive)_4%,var(--color-surface))] shadow-none after:border-[color:color-mix(in_oklab,var(--color-destructive)_18%,var(--color-border))]"
      : danger && state === "confirming"
        ? "after:border-[color:color-mix(in_oklab,var(--color-destructive)_24%,var(--color-border))]"
        : "";

  return (
    <div
      ref={rootRef}
      className={cn("group/cm relative inline-flex min-w-0 max-w-full align-middle text-sm leading-none tracking-[-0.01em] text-foreground [-webkit-tap-highlight-color:transparent] focus:outline-none", className)}
      data-state={state}
      data-tone={tone}
      data-disabled={disabled || undefined}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      aria-busy={state === "pending" || undefined}
      onPointerEnter={() => { holds.current.hover = true; sync(); }}
      onPointerLeave={() => { holds.current.hover = false; sync(); }}
      onPointerCancel={() => { holds.current.hover = false; sync(); }}
    >
      <motion.div
        className={cn(
          "relative flex h-10 max-w-full justify-center overflow-clip rounded-full bg-surface shadow-resting",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-border after:transition-colors after:duration-[var(--duration-standard)] after:content-['']",
          // Release springs back; the press itself is quick.
          "[transition:background-color_var(--duration-standard)_var(--ease-out-quint),box-shadow_var(--duration-standard)_var(--ease-out-quint),transform_var(--duration-spring)_var(--ease-spring)]",
          "group-has-[[data-trigger]:active:not(:disabled)]/cm:scale-[.96] group-has-[[data-trigger]:active:not(:disabled)]/cm:[transition-duration:var(--duration-standard),var(--duration-standard),90ms]",
          "motion-reduce:transition-none motion-reduce:group-has-[[data-trigger]:active]/cm:scale-100 contrast-more:after:border-border-strong",
          surfaceTone
        )}
        style={{ width }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <Face key={state} id={state} direction={direction} reduced={reduced} onSize={onFaceSize} labelledBy={state === "confirming" ? promptId : undefined}>{face}</Face>
        </AnimatePresence>
      </motion.div>
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    </div>
  );
}
