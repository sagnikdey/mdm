import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { easeEnter, easeStandard } from "../../lib/motion";
import { cn } from "../../lib/cn";

export const tooltipContent = [
  "z-90 max-w-60 px-3 py-2 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--color-background)_14%,var(--color-foreground))]",
  "bg-foreground text-background shadow-raised text-sm font-normal leading-snug",
  "origin-[var(--radix-tooltip-content-transform-origin)] [--tip-x:0px] [--tip-y:3px]",
  "data-[side=bottom]:[--tip-y:-3px] data-[side=left]:[--tip-x:3px] data-[side=left]:[--tip-y:0px] data-[side=right]:[--tip-x:-3px] data-[side=right]:[--tip-y:0px]",
  "[transition:opacity_var(--duration-fast)_var(--ease-enter),transform_var(--duration-fast)_var(--ease-enter)]",
  // The first tooltip waits, then rises a few pixels from its trigger. Within the skip window the next one only fades.
  "starting:[&[data-state$=-open]]:opacity-0 starting:[&[data-state$=-open]]:[transform:translate(var(--tip-x),var(--tip-y))_scale(.97)]",
  "starting:[&[data-instant][data-state$=-open]]:[transform:none]",
  "data-[state=closed]:opacity-0 data-[state=closed]:scale-[.98] data-[state=closed]:animate-[sg-exit_120ms_linear_both]",
  "data-[state=closed]:[transition:opacity_var(--duration-fast)_var(--ease-out-quint),transform_var(--duration-fast)_var(--ease-out-quint)]",
  "motion-reduce:!transform-none",
].join(" ");

const DELAY = 250;
const SKIP_WINDOW = 300;

/* Every Tooltip brings its own provider, so the skip window is shared here: while any tooltip is open,
   and briefly after the last one closes, the next opens without delay or travel. */
let warm = false;
let openCount = 0;
let coolTimer = 0;
const listeners = new Set<() => void>();
const warmth = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  get: () => warm,
  set(next: boolean) { if (warm === next) return; warm = next; listeners.forEach((l) => l()); },
  opened() { openCount += 1; window.clearTimeout(coolTimer); warmth.set(true); },
  closed() {
    openCount = Math.max(0, openCount - 1);
    if (openCount) return;
    window.clearTimeout(coolTimer);
    coolTimer = window.setTimeout(() => warmth.set(false), SKIP_WINDOW);
  },
};

/** String content crossfades when it changes while open, and the bubble springs to the new text size. */
function TooltipText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const measure = React.useRef<HTMLSpanElement>(null);
  const measured = React.useRef<string | null>(null);
  const [size, setSize] = React.useState<{ width: number; height: number; animate: boolean } | null>(null);
  React.useLayoutEffect(() => {
    const node = measure.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      const current = node.textContent;
      const animate = measured.current !== null && measured.current !== current;
      measured.current = current;
      setSize({ width: Math.ceil(box?.inlineSize ?? node.offsetWidth), height: Math.ceil(box?.blockSize ?? node.offsetHeight), animate });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <motion.span className="relative block overflow-clip [overflow-clip-margin:.5rem]" initial={false} animate={size ? { width: size.width, height: size.height } : undefined} transition={size?.animate && !reduced ? (spring.morph as never) : { duration: 0 }}>
      <span ref={measure} className="pointer-events-none invisible absolute top-0 left-0 w-max max-w-[calc(15rem-2*.75rem-2px)]" aria-hidden="true">{text}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          className="block w-max max-w-[calc(15rem-2*.75rem-2px)]"
          initial={reduced ? false : { opacity: 0, y: "0.3em", filter: `blur(${blur.soft}px)` }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.3em", filter: `blur(${blur.subtle}px)`, transition: { duration: duration.instant, ease: easeStandard } }}
          transition={{ duration: duration.standard, ease: easeEnter }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

/** Short supporting text for unfamiliar controls. Renders no wrapper element: the trigger is the child itself. */
export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const isWarm = React.useSyncExternalStore(warmth.subscribe, warmth.get, () => false);
  // Controlled so the instant flag lands in the same render that mounts the content.
  const [open, setOpen] = React.useState(false);
  const [instant, setInstant] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    warmth.opened();
    return warmth.closed;
  }, [open]);
  return (
    <TooltipPrimitive.Provider delayDuration={DELAY} skipDelayDuration={0}>
      <TooltipPrimitive.Root
        open={open}
        delayDuration={isWarm ? 0 : DELAY}
        onOpenChange={(next) => { if (next) setInstant(warmth.get()); setOpen(next); }}
      >
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className={cn(tooltipContent, className)} data-instant={instant || undefined} side={side} sideOffset={8} collisionPadding={12}>
            {typeof content === "string" || typeof content === "number" ? <TooltipText text={String(content)} /> : content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
