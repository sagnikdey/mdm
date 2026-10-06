import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, WheelEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, usePresence, useReducedMotion, useTransform } from "motion/react";
import { X } from "lucide-react";
import { duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeStandard } from "../../lib/motion";
import { closeButtonClass } from "../../lib/swap-text";

/**
 * A sheet that rises from the bottom edge and rests at one or more heights (detents).
 * Use it for secondary tasks where a peek is useful before committing to the full view: trip details, share options, filters.
 * Use a dialog when the decision must interrupt, and a drawer for side panels on wide layouts.
 */
export interface BottomSheetProps {
  /** The control that opens the sheet, usually a button. Focus returns to it when the sheet closes. */
  trigger?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  /** Resting heights as fractions of the viewport height. The sheet opens at `initialDetent` and never grows past the largest. */
  detents?: number[];
  /** Index into the sorted detents the sheet opens at. Defaults to the smallest. */
  initialDetent?: number;
  onDetentChange?: (index: number) => void;
  closeLabel?: string;
  className?: string;
  children: ReactNode;
}
type Stop = number | "closed";
type Drag = { startY: number; origin: number; from: number; moved: boolean; samples: { t: number; y: number }[] };

/** Extra surface below the viewport, so an upward stretch never shows a gap under the sheet. */
const EXTENSION = 160;
/** Enough travel below the edge to hide the floating shadow as well as the sheet. */
const CLOSED_GAP = 40;
/** How far a release coasts, in seconds of its velocity, before the nearest detent is chosen. */
const PROJECTION = .2;
/** A release faster than this (px/s) always moves at least one detent in its direction. */
const FLICK = 320;
/** The limit an upward stretch approaches past the tallest detent. */
const STRETCH = 120;
/** How much of the full dim remains at the smallest detent. */
const LOW_DIM = .78;

const settle = spring.smooth;
/** Leaving is shorter than arriving; a flick keeps its velocity through the same spring. */
const leave = { ...spring.smooth, visualDuration: .3 };
const fade = { duration: duration.quick, ease: easeStandard };

/** iOS-style resistance: follows the finger at first, then approaches STRETCH. */
const rubber = (distance: number) => (1 - 1 / (distance * .55 / STRETCH + 1)) * STRETCH;
const unrubber = (stretch: number) => (1 / (1 - Math.min(stretch, STRETCH - 1) / STRETCH) - 1) * STRETCH / .55;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function velocityOf(samples: Drag["samples"], now: number) {
  const recent = samples.filter(sample => now - sample.t <= 80);
  const first = recent[0], last = recent[recent.length - 1];
  // A pause before letting go drops the momentum, so a slow, deliberate release settles where it is.
  if (!first || !last || last === first || now - last.t > 60) return 0;
  return (last.y - first.y) / ((last.t - first.t) / 1000);
}

export function BottomSheet({ trigger, open: openProp, defaultOpen = false, onOpenChange, ...props }: BottomSheetProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const setOpen = useCallback((next: boolean) => {
    if (openProp === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  }, [openProp, onOpenChange]);
  const dismiss = useCallback(() => setOpen(false), [setOpen]);
  return <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
    {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
    {/* The sheet stays mounted while it leaves, so a close can be caught and reversed mid-flight. */}
    <AnimatePresence>{open && <DialogPrimitive.Portal key="sheet" forceMount><Sheet {...props} onDismiss={dismiss} /></DialogPrimitive.Portal>}</AnimatePresence>
  </DialogPrimitive.Root>;
}

function Sheet({ title, description, detents = [.45, .92], initialDetent = 0, onDetentChange, closeLabel = "Close", className, children, onDismiss }: Omit<BottomSheetProps, "trigger" | "open" | "defaultOpen" | "onOpenChange"> & { onDismiss: () => void }) {
  const [isPresent, safeToRemove] = usePresence();
  const reduced = useReducedMotion() ?? false;
  const detentKey = detents.join(",");
  const stops = useMemo(() => detentKey.split(",").map(Number).filter(stop => stop > 0).sort((a, b) => a - b), [detentKey]);
  const top = stops.length - 1;
  const [detent, setDetent] = useState(() => clamp(Math.round(initialDetent), 0, top));
  const [announcement, setAnnouncement] = useState("");
  const sheetRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  /** Offset of the sheet below its tallest detent, in px. Starts far below the fold so the first frame never flashes. */
  const y = useMotionValue(4000);
  const height = useMotionValue(0);
  const presence = useMotionValue(1);
  const detentRef = useRef(detent);
  const aim = useRef<Stop>(detent);
  const drag = useRef<Drag | null>(null);
  const arrive = useRef<(() => void) | undefined>(undefined);
  const suppressClick = useRef(false);
  const mounted = useRef(false);
  /** When the sheet last started entering or leaving, so a press that began while it was leaving never dismisses it once it is reopened. */
  const presenceChange = useRef({ present: isPresent, at: 0 });
  useLayoutEffect(() => { presenceChange.current = { present: isPresent, at: performance.now() }; }, [isPresent]);

  const offset = useCallback((stop: Stop) => {
    const full = height.get();
    return stop === "closed" ? full + CLOSED_GAP : full * (1 - stops[stop] / stops[top]);
  }, [height, stops, top]);

  // The backdrop is a function of where the sheet is, so it darkens and clears with a drag instead of on a timer.
  const backdrop = useTransform([y, height, presence], ([offsetY, full, shown]: number[]) => {
    if (!full) return 0;
    const low = full * (1 - stops[0] / stops[top]), closed = full + CLOSED_GAP;
    const dim = offsetY <= low ? 1 - (1 - LOW_DIM) * (low ? offsetY / low : 0) : LOW_DIM * (1 - (offsetY - low) / (closed - low));
    return clamp(dim, 0, 1) * shown;
  });

  // Every move retargets the one motion value from wherever it is. A new target drops the previous arrival callback.
  const go = useCallback((stop: Stop, velocity?: number, onArrive?: () => void) => {
    aim.current = stop;
    arrive.current = onArrive;
    const target = offset(stop);
    const done = () => { const callback = arrive.current; arrive.current = undefined; callback?.(); };
    if (reduced) { y.jump(target); done(); return; }
    animate(y, target, { ...(stop === "closed" ? leave : settle), ...(velocity === undefined ? {} : { velocity }), onComplete: done });
  }, [offset, reduced, y]);

  const rest = useCallback((stop: number, velocity?: number) => {
    if (stop !== detentRef.current) {
      detentRef.current = stop;
      setDetent(stop);
      onDetentChange?.(stop);
      setAnnouncement(stop === top ? "Sheet expanded" : stop === 0 ? "Sheet collapsed" : `Sheet at ${Math.round(stops[stop] * 100)} percent height`);
    }
    // Collapsing takes the content back to its start, so the peek always shows the top of it.
    const body = bodyRef.current;
    if (stop !== top && body && body.scrollTop > 0) body.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    go(stop, velocity);
  }, [go, onDetentChange, reduced, stops, top]);

  // Enter, leave, and a reopen caught mid-exit all retarget the same motion value from wherever it is.
  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (!mounted.current) {
      mounted.current = true;
      height.set(sheet.offsetHeight - EXTENSION);
      y.jump(offset("closed"));
      if (reduced) { y.jump(offset(detentRef.current)); presence.jump(0); }
    }
    if (isPresent) {
      if (reduced) { y.jump(offset(detentRef.current)); animate(presence, 1, fade); return; }
      presence.jump(1);
      go(detentRef.current);
      return;
    }
    if (reduced) { animate(presence, 0, { ...fade, onComplete: safeToRemove }); return; }
    // A flick has already started the exit with its own velocity; only the unmount waits for it.
    if (aim.current === "closed" && y.isAnimating()) arrive.current = safeToRemove;
    else go("closed", undefined, safeToRemove);
  }, [go, height, isPresent, offset, presence, reduced, safeToRemove, y]);

  // A viewport change (rotation, the mobile toolbar) moves every detent. Keep the sheet on its detent, retargeting any flight.
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const next = sheet.offsetHeight - EXTENSION;
      if (next === height.get()) return;
      height.set(next);
      const stop = aim.current;
      if (drag.current || stop === "closed") return;
      if (y.isAnimating()) go(stop); else y.jump(offset(stop));
    });
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [go, height, offset, y]);

  const beginDrag = useCallback((clientY: number, time: number) => {
    // Catch the sheet where it is, even mid-flight; an overstretched sheet converts back to finger distance so nothing jumps.
    y.stop();
    const current = y.get();
    drag.current = { startY: clientY, origin: current < 0 ? -unrubber(-current) : current, from: detentRef.current, moved: false, samples: [{ t: time, y: clientY }] };
  }, [y]);

  const moveDrag = useCallback((clientY: number, time: number) => {
    const state = drag.current;
    if (!state) return;
    const delta = clientY - state.startY;
    if (!state.moved) {
      if (Math.abs(delta) < 3) return;
      state.moved = true;
      sheetRef.current?.setAttribute("data-dragging", "");
    }
    const raw = state.origin + delta;
    // Down follows the finger 1:1 so it can dismiss; up past the tallest detent resists like a rubber band.
    y.set(raw < 0 ? -rubber(-raw) : raw);
    state.samples.push({ t: time, y: clientY });
    if (state.samples.length > 12) state.samples.shift();
  }, [y]);

  const endDrag = useCallback((time: number) => {
    const state = drag.current;
    drag.current = null;
    sheetRef.current?.removeAttribute("data-dragging");
    if (!state) return;
    if (!state.moved) { const stop = aim.current; if (stop !== "closed") go(stop); return; }
    suppressClick.current = true;
    const current = y.get();
    // A stretched sheet springs back without the finger's speed, so it never launches past the stretch.
    const velocity = current < 0 ? 0 : velocityOf(state.samples, time);
    const projected = current + velocity * PROJECTION;
    const candidates: Stop[] = [...stops.map((_, index) => index), "closed"];
    let target = candidates.reduce((best, stop) => Math.abs(offset(stop) - projected) < Math.abs(offset(best) - projected) ? stop : best);
    // A quick flick always travels at least one detent, and a flick down from the smallest one closes the sheet.
    if (Math.abs(velocity) > FLICK && target === state.from) target = velocity < 0 ? Math.min(state.from + 1, top) : state.from === 0 ? "closed" : state.from - 1;
    // The exit starts in this frame with the finger's velocity; closing the dialog only waits for it to land.
    if (target === "closed") { if (!reduced) go("closed", velocity); onDismiss(); return; }
    rest(target, velocity);
  }, [go, offset, onDismiss, reduced, rest, stops, top, y]);

  // Touch drags on the content move the sheet until it is fully open; once open, the content scrolls and a pull down from its top moves the sheet again.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    let gesture: { x: number; y: number; mode: "pending" | "sheet" | "native" } | null = null;
    const start = (event: TouchEvent) => {
      const touch = event.touches[0];
      gesture = event.touches.length === 1 && touch ? { x: touch.clientX, y: touch.clientY, mode: "pending" } : null;
    };
    const move = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!gesture || !touch || event.touches.length !== 1) return;
      const dx = touch.clientX - gesture.x, dy = touch.clientY - gesture.y;
      if (gesture.mode === "pending") {
        const expanded = detentRef.current === top;
        if (expanded) {
          const scrollable = body.scrollHeight > body.clientHeight + 1;
          gesture.mode = Math.abs(dy) >= Math.abs(dx) && (!scrollable || (body.scrollTop <= 0 && dy > 0)) ? "sheet" : "native";
        } else {
          if (Math.hypot(dx, dy) < 4) return;
          gesture.mode = Math.abs(dy) >= Math.abs(dx) ? "sheet" : "native";
        }
        if (gesture.mode === "sheet") beginDrag(touch.clientY, event.timeStamp);
      }
      if (gesture.mode !== "sheet") return;
      if (event.cancelable) event.preventDefault();
      moveDrag(touch.clientY, event.timeStamp);
    };
    const end = (event: TouchEvent) => {
      if (gesture?.mode === "sheet") endDrag(event.timeStamp);
      gesture = null;
    };
    body.addEventListener("touchstart", start, { passive: true });
    body.addEventListener("touchmove", move, { passive: false });
    body.addEventListener("touchend", end);
    body.addEventListener("touchcancel", end);
    return () => {
      body.removeEventListener("touchstart", start);
      body.removeEventListener("touchmove", move);
      body.removeEventListener("touchend", end);
      body.removeEventListener("touchcancel", end);
    };
  }, [beginDrag, endDrag, moveDrag, top]);

  // The scroll hairline under the header is toggled on the element directly, so scrolling never re-renders.
  useEffect(() => {
    const body = bodyRef.current, sheet = sheetRef.current;
    if (!body || !sheet) return;
    const update = () => sheet.toggleAttribute("data-scrolled", body.scrollTop > 1);
    body.addEventListener("scroll", update, { passive: true });
    return () => body.removeEventListener("scroll", update);
  }, []);

  function headerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target instanceof Element ? event.target : null;
    if (event.button !== 0 || !event.isPrimary) return;
    if (target?.closest("button, a, input, select, textarea, [role='button']") && !target.closest("[data-grabber]")) return;
    beginDrag(event.clientY, event.timeStamp);
    // Moves arrive once per frame, so a fast flick can leave the header before its first move lands.
    // Until the header captures the pointer, the window follows it; once captured, the header's own handlers take over.
    const header = event.currentTarget, id = event.pointerId;
    const outside = (next: PointerEvent) => next.pointerId === id && !(next.target instanceof Node && header.contains(next.target));
    const move = (next: PointerEvent) => {
      if (!outside(next) || !drag.current) return;
      moveDrag(next.clientY, next.timeStamp);
      if (drag.current?.moved && !header.hasPointerCapture(id)) { try { header.setPointerCapture(id); } catch { /* The pointer is already gone. */ } }
    };
    const up = (next: PointerEvent) => {
      if (next.pointerId !== id) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (outside(next)) endDrag(next.timeStamp);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }
  // Capture only once the pointer has really moved, so a plain click still lands on the grabber button.
  function headerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    if (event.pointerType === "mouse" && event.buttons === 0) { endDrag(event.timeStamp); return; }
    moveDrag(event.clientY, event.timeStamp);
    if (drag.current.moved && !event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
  }
  function headerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    endDrag(event.timeStamp);
  }

  function grabberClick() {
    if (suppressClick.current) { suppressClick.current = false; return; }
    rest(detentRef.current === top ? 0 : top);
  }
  function grabberKey(event: KeyboardEvent<HTMLButtonElement>) {
    const current = detentRef.current;
    const next = event.key === "ArrowUp" ? Math.min(current + 1, top) : event.key === "ArrowDown" ? Math.max(current - 1, 0) : event.key === "Home" ? top : event.key === "End" ? 0 : null;
    if (next === null) return;
    event.preventDefault();
    rest(next);
  }

  // Scrolling or tabbing into content that is still below the fold opens the sheet the rest of the way.
  function bodyWheel(event: WheelEvent<HTMLDivElement>) {
    if (detentRef.current !== top && event.deltaY > 4 && !drag.current) rest(top);
  }
  function bodyFocus(event: FocusEvent<HTMLDivElement>) {
    if (detentRef.current === top || !(event.target instanceof Element)) return;
    if (event.target.getBoundingClientRect().bottom > window.innerHeight - 8) rest(top);
  }

  // With focus on the sheet or its content, reading keys open the sheet first and then scroll the content.
  function sheetKey(event: KeyboardEvent<HTMLDivElement>) {
    const body = bodyRef.current;
    if (!body || (event.target !== event.currentTarget && event.target !== body)) return;
    const down = event.key === "ArrowDown" || event.key === "PageDown" || (event.key === " " && !event.shiftKey);
    const up = event.key === "ArrowUp" || event.key === "PageUp" || (event.key === " " && event.shiftKey);
    if (!down && !up) return;
    event.preventDefault();
    if (down && detentRef.current !== top) { rest(top); return; }
    const step = event.key.startsWith("Arrow") ? 48 : body.clientHeight * .85;
    body.scrollBy({ top: down ? step : -step, behavior: reduced ? "auto" : "smooth" });
  }


  const expanded = detent === top;
  const style = { y, opacity: presence, "--sheet-max": stops[top], "--sheet-extension": `${EXTENSION}px` } as unknown as CSSProperties;

  return (
    <>
      <DialogPrimitive.Overlay asChild forceMount>
        {/* The dim follows the sheet's position in JS; only its color lives here. */}
        <motion.div className="fixed inset-0 z-50 bg-[oklch(16%_0_0/.34)] data-[state=closed]:!pointer-events-none dark:bg-[oklch(0%_0_0/.52)]" style={{ opacity: backdrop }} />
      </DialogPrimitive.Overlay>
      <DialogPrimitive.Content
        asChild
        forceMount
        {...(description ? {} : { "aria-describedby": undefined })}
        onOpenAutoFocus={(event) => { event.preventDefault(); sheetRef.current?.focus({ preventScroll: true }); }}
        // Radix waits for the click before treating a press as outside. A press on the trigger while the sheet leaves reopens it first, so that press must not close it again.
        onPointerDownOutside={(event) => { const { present, at } = presenceChange.current; if (!present || event.detail.originalEvent.timeStamp < at) event.preventDefault(); }}
      >
        {/* The sheet is as tall as its largest detent plus a hidden extension below the fold; detents are translateY offsets from there. */}
        <motion.div
          ref={sheetRef}
          className={cn(
            "group/sheet fixed inset-x-0 bottom-[calc(var(--sheet-extension)*-1)] z-51 mx-auto flex h-[calc(var(--sheet-max)*100dvh+var(--sheet-extension))] w-[min(100%,36rem)] flex-col overflow-hidden",
            "rounded-t-[var(--radius-xl)] border border-b-0 border-border bg-surface pb-[calc(var(--sheet-extension)+env(safe-area-inset-bottom,0px))] text-foreground shadow-floating outline-none will-change-transform",
            "data-[state=closed]:!pointer-events-none",
            className
          )}
          style={style}
          data-expanded={expanded ? "" : undefined}
          onKeyDown={sheetKey}
        >
          {/* The whole header is the handle, so a drag can start anywhere above the content. A hairline appears only once the content scrolls under it. */}
          <div
            className="relative flex-none cursor-grab touch-none select-none px-5 pt-2 pb-4 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:opacity-0 after:transition-opacity after:duration-[var(--duration-quick)] after:content-[''] group-data-[dragging]/sheet:cursor-grabbing group-data-[scrolled]/sheet:after:opacity-100 max-sm:px-4 motion-reduce:after:transition-none"
            onPointerDown={headerDown}
            onPointerMove={headerMove}
            onPointerUp={headerUp}
            onPointerCancel={headerUp}
          >
            <button type="button" className="group/grab mx-auto mb-1 flex h-5 w-14 cursor-[inherit] items-center justify-center rounded-full border-0 bg-transparent p-0 [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-grabber="" aria-label={expanded ? "Collapse sheet" : "Expand sheet"} aria-expanded={expanded} onClick={grabberClick} onKeyDown={grabberKey}>
              <span className="h-[5px] w-9 rounded-full bg-border-strong transition-colors duration-[var(--duration-quick)] group-data-[dragging]/sheet:bg-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:group-hover/grab:bg-muted-foreground motion-reduce:transition-none" aria-hidden="true" />
            </button>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <DialogPrimitive.Title className="m-0 text-lg font-medium leading-snug tracking-[-0.01em]">{title}</DialogPrimitive.Title>
                {description ? <DialogPrimitive.Description className="mt-0.5 text-sm leading-snug text-muted-foreground">{description}</DialogPrimitive.Description> : null}
              </div>
              <DialogPrimitive.Close className={cn(closeButtonClass, "-mt-0.5 rounded-full")} aria-label={closeLabel}>
                <X size={16} strokeWidth={1.75} aria-hidden="true" />
              </DialogPrimitive.Close>
            </div>
          </div>
          {/* The content scrolls only at the tallest detent; below it, a drag or scroll opens the sheet first. */}
          <div ref={bodyRef} className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pt-1 pb-6 text-sm leading-snug [scrollbar-width:thin] group-not-data-[expanded]/sheet:touch-none group-not-data-[expanded]/sheet:overflow-hidden max-sm:px-4" onWheel={bodyWheel} onFocus={bodyFocus}>{children}</div>
          <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
        </motion.div>
      </DialogPrimitive.Content>
    </>
  );
}

export const BottomSheetClose = DialogPrimitive.Close;
