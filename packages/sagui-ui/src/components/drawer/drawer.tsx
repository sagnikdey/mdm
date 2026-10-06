import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { PanInfo, Transition } from "motion/react";
import { X } from "lucide-react";
import { duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";
import { SwapText, closeButtonClass } from "../../lib/swap-text";

/** Mirrors the open state so the panel can stay mounted while it slides out, retarget mid-flight, and close itself after a drag. */
const DrawerContext = React.createContext<{ open: boolean; flung: boolean; setOpen: (open: boolean) => void; fling: () => void; openedAt: React.RefObject<number> } | null>(null);

export function Drawer({ open: openProp, defaultOpen = false, onOpenChange, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  // A drag that dismisses the panel hands its velocity to the exit spring; every other close uses the shorter tween.
  const [flung, setFlung] = React.useState(false);
  // When the drawer last opened, so a click that reopens it mid-close is not also read as a click outside the leaving panel.
  const openedAt = React.useRef(0);
  const open = openProp ?? uncontrolled;
  const setOpen = React.useCallback((next: boolean) => {
    setFlung(false);
    if (next) openedAt.current = performance.now();
    if (openProp === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  }, [openProp, onOpenChange]);
  const fling = React.useCallback(() => { setOpen(false); setFlung(true); }, [setOpen]);
  const value = React.useMemo(() => ({ open, flung, setOpen, fling, openedAt }), [open, flung, setOpen, fling]);
  return <DrawerContext.Provider value={value}><DialogPrimitive.Root {...props} open={open} onOpenChange={setOpen} /></DrawerContext.Provider>;
}

export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  title: string;
  description?: string;
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  /** Renders the drawer inside this element instead of the page body, anchored to its edges. The element needs position: relative and overflow: hidden. */
  container?: HTMLElement | null;
}

const fade: Transition = { duration: duration.instant };
/* A click or Escape returns the panel quickly; a flick keeps its velocity in a spring of the same length. The shadow fades over the last stretch so it leaves with the panel instead of popping away at unmount. */
const shadowOut: Transition = { duration: duration.standard, times: [0, 0.65, 1], ease: "linear" };
const leave: Transition = { default: { duration: duration.standard, ease: easeStandard }, opacity: shadowOut };
const flingOut: Transition = { default: { ...spring.smooth, visualDuration: duration.standard }, opacity: shadowOut } as never;

const sides = {
  right: "top-0 right-0 bottom-0 rounded-l-[22px] border border-r-0 max-sm:rounded-l-[18px]",
  left: "top-0 bottom-0 left-0 rounded-r-[22px] border border-l-0 max-sm:rounded-r-[18px]",
  top: "inset-x-0 top-0 w-full max-w-none max-h-[min(32rem,100dvh)] rounded-b-[22px] border border-t-0 max-sm:rounded-b-[18px]",
  bottom: "inset-x-0 bottom-0 w-full max-w-none max-h-[min(32rem,100dvh)] rounded-t-[22px] border border-b-0 max-sm:rounded-t-[18px] before:absolute before:top-[9px] before:left-1/2 before:h-1 before:w-9 before:-translate-x-1/2 before:rounded-full before:bg-border-strong before:opacity-75 before:content-['']",
} as const;
// The container already draws the outer edges, so only the inner edge keeps a border.
const containedSides = { right: "border-0 border-l", left: "border-0 border-r", top: "border-0 border-b", bottom: "border-0 border-t" } as const;

/** A temporary side surface for focused work. Slides from any edge, can be dragged shut by its header, and traps focus like a dialog. */
export function DrawerContent({ title, description, children, side = "right", container, className, onInteractOutside, ...props }: DrawerContentProps) {
  const drawer = React.useContext(DrawerContext);
  const reduced = useReducedMotion();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const offset = useMotionValue<number | string>(0);
  const pan = React.useRef<number | null>(null);
  const axis = side === "left" || side === "right" ? "x" : "y";
  const sign = side === "right" || side === "bottom" ? 1 : -1;
  const offscreen = { [axis]: `${sign * 100}%` };
  const contained = !!container;
  const draggable = drawer !== null && !reduced;
  const classes = cn(
    "fixed z-51 flex w-[var(--drawer-size)] max-w-screen max-h-dvh flex-col overflow-hidden border-border bg-surface text-foreground shadow-overlay focus:outline-none data-[state=closed]:!pointer-events-none",
    "[--drawer-size:min(30rem,calc(100vw-1rem))] max-sm:[--drawer-size:calc(100vw-.75rem)]",
    sides[side],
    contained && cn("absolute z-2 max-h-full shadow-none [--drawer-size:min(22rem,calc(100%-2rem))]", containedSides[side], (side === "top" || side === "bottom") && "max-h-[min(32rem,calc(100%-2rem))]"),
    className
  );
  const overlayClass = cn("fixed inset-0 z-50 bg-[oklch(10%_0_0/.38)] backdrop-blur-[4px] data-[state=closed]:!pointer-events-none", contained && "absolute z-1 bg-[oklch(10%_0_0/.16)] backdrop-blur-none");

  const panelSize = () => (axis === "x" ? panelRef.current?.offsetWidth : panelRef.current?.offsetHeight) ?? 480;

  // The header is the grab handle. It follows the pointer toward the edge and rubber-bands the other way.
  function panStart(event: PointerEvent) {
    const target = event.target instanceof Element ? event.target : null;
    if (!draggable || target?.closest("button, a, input, select, textarea, [role='button']")) return;
    // The entrance animates in percent of the panel, so a grab mid-flight converts it to pixels.
    const value = offset.get();
    pan.current = typeof value === "number" ? value : (parseFloat(value) / 100) * panelSize();
    offset.stop();
  }
  function panMove(_: PointerEvent, info: PanInfo) {
    if (pan.current === null) return;
    const toward = (pan.current + info.offset[axis]) * sign;
    offset.set(sign * (toward >= 0 ? toward : -Math.sqrt(-toward)));
  }
  // Past a third of the panel, or on a quick flick toward the edge, the drawer closes and keeps its velocity; otherwise it springs back.
  function panEnd(_: PointerEvent, info: PanInfo) {
    if (pan.current === null) return;
    pan.current = null;
    const toward = Number(offset.get()) * sign;
    if (toward > panelSize() / 3 || (toward > 0 && info.velocity[axis] * sign > 500)) drawer?.fling();
    else animate(offset as never, 0, spring.snappy as never);
  }

  const inner = (
    <>
      <motion.div className={cn("flex flex-none items-start justify-between gap-5 border-b border-border p-6 max-sm:p-5", draggable && "touch-none select-none", draggable && (side === "bottom" || side === "top") && "cursor-grab")} onPanStart={panStart} onPan={panMove} onPanEnd={panEnd}>
        <div>
          <DialogPrimitive.Title className="relative m-0 text-lg font-medium leading-snug tracking-[-0.01em]"><SwapText text={title} /></DialogPrimitive.Title>
          {description ? <DialogPrimitive.Description className="relative mt-2 max-w-lg text-sm leading-snug text-muted-foreground"><SwapText text={description} /></DialogPrimitive.Description> : null}
        </div>
        <DialogPrimitive.Close className={cn(closeButtonClass, "my-[-3.4px]")} aria-label="Close drawer"><X size={16} strokeWidth={1.75} aria-hidden="true" /></DialogPrimitive.Close>
      </motion.div>
      <div className="min-h-0 overflow-auto overscroll-contain p-6 text-sm leading-snug [scrollbar-width:thin] max-sm:p-5">{children}</div>
    </>
  );

  // Outside our Drawer root the open state is unknown, so the layers render without motion.
  if (drawer === null) {
    return (
      <DialogPrimitive.Portal container={container}>
        <DialogPrimitive.Overlay className={overlayClass} />
        <DialogPrimitive.Content {...props} onInteractOutside={onInteractOutside} className={classes}>{inner}</DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  }

  // The panel springs fully opaque from its own edge and returns to it faster than it arrived, from wherever it is.
  return (
    <AnimatePresence custom={drawer.flung}>
      {drawer.open && (
        <DialogPrimitive.Portal key="drawer" forceMount container={container}>
          <DialogPrimitive.Overlay asChild forceMount>
            <motion.div
              className={overlayClass}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: reduced ? fade : { duration: duration.quick, ease: easeStandard } }}
              transition={reduced ? fade : { duration: duration.standard, ease: easeEnter }}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content
            {...props}
            asChild
            forceMount
            // Radix reads a click outside on click, so the press that reopens a closing drawer would dismiss it again.
            onInteractOutside={(event) => {
              onInteractOutside?.(event);
              if (event.detail.originalEvent.timeStamp < drawer.openedAt.current) event.preventDefault();
            }}
          >
            <motion.div
              ref={panelRef}
              className={classes}
              data-side={side}
              style={{ [axis]: offset }}
              variants={{ exit: (flung: boolean) => (reduced ? { opacity: 0, transition: fade } : { ...offscreen, opacity: [1, 1, 0], transition: flung ? flingOut : leave }) }}
              initial={reduced ? { opacity: 0 } : { ...offscreen, opacity: 1 }}
              animate={reduced ? { opacity: 1 } : { [axis]: 0, opacity: 1 }}
              exit="exit"
              transition={reduced ? fade : (spring.smooth as never)}
            >
              {inner}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}
