import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type Variants } from "motion/react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";
import { AnimatedCounter } from "../animated-counter/animated-counter";

export interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  /** One short line under the number that gives it meaning, such as "Compared with last week". */
  context: string;
  /** A signed change such as "+12.4%". A leading plus reads green, a leading minus red. */
  change?: string;
  className?: string;
}

/** Copy that holds a number enters from the side it moved toward: a larger value rises from below, a smaller one drops from above. */
const rise: Variants = {
  hidden: (direction: number) => ({ opacity: 0, y: `${0.3 * direction}em`, filter: `blur(${blur.soft}px)` }),
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.standard, ease: easeEnter } },
  gone: (direction: number) => ({ opacity: 0, y: `${-0.3 * direction}em`, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.quick, ease: easeStandard } }),
};
const fade: Variants = { hidden: { opacity: 0, y: 0, filter: "blur(0px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.instant } }, gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: duration.instant } } };
const amountIn = (text: string) => Number(text.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/)?.[0] ?? NaN);

/** New copy rises in while the old copy leaves; `morph` springs the wrapper to the new text's width instead of letting it snap. */
function Swap({ text, morph = false, block = false }: { text: string; morph?: boolean; block?: boolean }) {
  const reduceMotion = !!useReducedMotion();
  const sizer = React.useRef<HTMLSpanElement>(null);
  const width = useMotionValue<number | "auto">("auto");
  const [shown, setShown] = React.useState({ text, direction: 1 });
  if (shown.text !== text) setShown({ text, direction: amountIn(text) < amountIn(shown.text) ? -1 : 1 });
  React.useEffect(() => {
    const node = sizer.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let measured: string | null = null;
    // Layout size, not the transformed rect, so a scaling parent never leaves the text clipped. Only a new text springs; font loads jump.
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth;
      if (next && measured !== null && measured !== node.textContent && !reduceMotion) animate(width as never, next, spring.morph as never);
      else width.jump(next || "auto");
      measured = next ? node.textContent : null;
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [morph, reduceMotion, width]);
  return (
    // The outgoing copy is popped out of flow so the wrapper never holds both widths.
    <motion.span className={cn("relative max-w-full", block ? "block" : "inline-flex overflow-x-clip align-top whitespace-nowrap")} style={morph ? { width } : undefined}>
      {morph && <span ref={sizer} className="pointer-events-none invisible absolute top-0 left-0 whitespace-nowrap" aria-hidden="true">{text}</span>}
      <AnimatePresence mode="popLayout" initial={false} custom={shown.direction}>
        <motion.span key={text} className={block ? "block" : "inline-block"} custom={shown.direction} variants={reduceMotion ? fade : rise} initial="hidden" animate="shown" exit="gone">{text}</motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

/** A compact summary for a number that needs context. The number rolls, and the label, change and context reword in place. */
export function MetricCard({ label, value, suffix, prefix, decimals, context, change, className }: MetricCardProps) {
  const reduceMotion = !!useReducedMotion();
  const trend = change && /^[+]/.test(change) ? "up" : change && /^[-−]/.test(change) ? "down" : undefined;
  return (
    <article className={cn("min-w-0 rounded-[var(--radius-xl)] border border-border bg-surface p-6 shadow-resting max-[380px]:p-4", className)}>
      <div className="mb-8 flex items-center justify-between gap-3 text-sm max-[380px]:mb-6 max-[380px]:flex-wrap max-[380px]:items-start">
        <span className="text-muted-foreground"><Swap text={label} block /></span>
        <AnimatePresence initial={false}>
          {change && (
            <motion.small
              key="change"
              className={cn(
                "inline-flex flex-none rounded-full border border-border px-2 py-[3px] text-sm tabular-nums text-muted-foreground transition-colors duration-[var(--duration-quick)] motion-reduce:transition-none",
                trend === "up" && "border-transparent bg-[color-mix(in_oklab,var(--color-success)_11%,transparent)] text-success",
                trend === "down" && "border-transparent bg-[color-mix(in_oklab,var(--color-destructive)_11%,transparent)] text-destructive"
              )}
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.96, transition: { duration: duration.quick, ease: easeStandard } }}
              transition={reduceMotion ? { duration: 0 } : (spring.snappy as never)}
            >
              <Swap text={change} morph />
            </motion.small>
          )}
        </AnimatePresence>
      </div>
      <AnimatedCounter value={value} suffix={suffix} prefix={prefix} decimals={decimals} animateOnView />
      <p className="m-0 mt-4 text-sm leading-snug text-muted-foreground"><Swap text={context} block /></p>
    </article>
  );
}
