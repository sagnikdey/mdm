import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { X } from "lucide-react";
import { duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";
import { SwapText, closeButtonClass } from "../../lib/swap-text";

/** Mirrors the open state so the content can stay mounted while it animates out, and retarget mid-flight if it is reopened or closed early. */
const OpenContext = React.createContext<boolean | null>(null);

export function Dialog({ open: openProp, defaultOpen = false, onOpenChange, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const setOpen = React.useCallback((next: boolean) => {
    if (openProp === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  }, [openProp, onOpenChange]);
  return <OpenContext.Provider value={open}><DialogPrimitive.Root {...props} open={open} onOpenChange={setOpen} /></OpenContext.Provider>;
}

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const fade: Transition = { duration: duration.instant };
const leave: Transition = { duration: duration.quick, ease: easeStandard };

const overlayClass = "fixed inset-0 z-50 bg-[oklch(10%_0_0/.46)] backdrop-blur-[7px] data-[state=closed]:!pointer-events-none";
// Centered with auto margins (like a native modal dialog) so transform stays free for the entrance spring.
const contentClass = "fixed inset-0 z-51 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[min(calc(100vw-2rem),440px)] overflow-auto rounded-[var(--radius-xl)] border border-border bg-surface text-foreground shadow-overlay focus:outline-none data-[state=closed]:!pointer-events-none";

/** A focused surface for decisions that need attention. Focus is trapped, Escape closes, and the page behind is inert. */
export function DialogContent({ title, description, children, className, onPointerDownOutside, ...props }: DialogContentProps) {
  const open = React.useContext(OpenContext);
  const reduced = useReducedMotion();
  // When the open state last changed. Radix waits for the click before treating a press as outside, and a press on the trigger
  // while the dialog leaves reopens it first, so that press must not close it again.
  const change = React.useRef({ open, at: 0 });
  React.useLayoutEffect(() => { change.current = { open, at: performance.now() }; }, [open]);
  const pressOutside: DialogContentProps["onPointerDownOutside"] = (event) => {
    onPointerDownOutside?.(event);
    if (open !== null && (!change.current.open || event.detail.originalEvent.timeStamp < change.current.at)) event.preventDefault();
  };
  const classes = cn(contentClass, className);
  const inner = (
    <>
      <div className="flex items-start justify-between gap-5 border-b border-border p-6">
        <div>
          <DialogPrimitive.Title className="relative m-0 text-lg font-medium leading-snug tracking-[-0.01em] [overflow-wrap:anywhere]"><SwapText text={title} /></DialogPrimitive.Title>
          {description ? <DialogPrimitive.Description className="relative mt-2 text-sm leading-snug text-muted-foreground [overflow-wrap:anywhere]"><SwapText text={description} /></DialogPrimitive.Description> : null}
        </div>
        {/* Centred on the title's first line: (line height - button) / 2. */}
        <DialogPrimitive.Close className={cn(closeButtonClass, "my-[-3.4px]")} aria-label="Close dialog"><X size={16} strokeWidth={1.75} aria-hidden="true" /></DialogPrimitive.Close>
      </div>
      <div className="p-6 text-sm leading-snug">{children}</div>
    </>
  );
  // Outside our Dialog root the open state is unknown, so the layers render without motion.
  if (open === null) {
    return (
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayClass} />
        <DialogPrimitive.Content {...props} onPointerDownOutside={pressOutside} className={classes}>{inner}</DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  }
  // The overlay fades while the dialog rises 8px and scales up on a spring. Closing is shorter and quieter, and starts from wherever the entrance is.
  return (
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Portal key="dialog" forceMount>
          <DialogPrimitive.Overlay asChild forceMount>
            <motion.div className={overlayClass} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: reduced ? fade : leave }} transition={reduced ? fade : { duration: duration.standard, ease: easeEnter }} />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content {...props} onPointerDownOutside={pressOutside} asChild forceMount>
            <motion.div
              className={classes}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0, transition: fade } : { opacity: 0, y: 4, scale: 0.98, transition: leave }}
              transition={reduced ? fade : ({ default: spring.smooth, opacity: { duration: duration.quick, ease: easeEnter } } as never)}
            >
              {inner}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}
