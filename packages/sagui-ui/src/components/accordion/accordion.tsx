import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Variants } from "motion/react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";

export interface AccordionItem { title: string; content: React.ReactNode }
export interface AccordionProps {
  items: AccordionItem[];
  /** Index of the item open on first render. Pass -1 to start closed. */
  defaultOpen?: number;
  /** "lg" suits page-level FAQs: questions at the large text size, answers at body size. */
  size?: "md" | "lg";
  className?: string;
}

/** Height follows the content on a spring that never overshoots; closed panels leave the accessibility tree once they finish collapsing. */
const panelOpen: TargetAndTransition = { height: "auto", opacity: 1, visibility: "visible" };
const panelClosed: TargetAndTransition = { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" } };
/** The answer settles down into place with a brief focus pull as the panel opens. */
const contentOpen: TargetAndTransition = { y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } };
const contentClosed: TargetAndTransition = { y: -6, filter: `blur(${blur.subtle}px)` };
const panelMotion: Variants = {
  open: { ...panelOpen, transition: { height: spring.smooth, opacity: { duration: duration.standard, ease: easeEnter } } as never },
  closed: { ...panelClosed, transition: { height: spring.smooth, opacity: { duration: duration.fast, ease: easeStandard } } as never },
};
const contentMotion: Variants = {
  open: { ...contentOpen, transition: { y: spring.smooth, filter: { duration: duration.standard, ease: easeEnter } } as never },
  closed: { ...contentClosed, transition: { duration: duration.fast, ease: easeStandard } },
};
/** Reduced motion: same end states in one step, so server and client render identical styles. */
const panelStill: Variants = { open: { ...panelOpen, transition: { duration: 0 } }, closed: { ...panelClosed, transition: { duration: 0 } } };
const contentStill: Variants = { open: { ...contentOpen, transition: { duration: 0 } }, closed: { ...contentClosed, transition: { duration: 0 } } };

/** One answer open at a time, with a height that follows the content. */
export function Accordion({ items, defaultOpen = 0, size = "md", className }: AccordionProps) {
  const initialValue = defaultOpen >= 0 && defaultOpen < items.length ? String(defaultOpen) : "";
  const [openValue, setOpenValue] = React.useState(initialValue);
  const reduced = useReducedMotion();
  const lg = size === "lg";
  return (
    <AccordionPrimitive.Root className={cn("w-full border-t border-border", className)} type="single" collapsible value={openValue} onValueChange={setOpenValue}>
      {items.map((item, index) => {
        const open = openValue === String(index);
        return (
          <AccordionPrimitive.Item className="group/acc border-b border-border" value={String(index)} key={`${item.title}-${index}`}>
            <AccordionPrimitive.Header className="m-0">
              <AccordionPrimitive.Trigger
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between border-0 bg-transparent py-2 text-left font-medium leading-relaxed text-foreground [-webkit-tap-highlight-color:transparent] transition-colors duration-fast ease-out-quint [@media(hover:hover)_and_(pointer:fine)]:hover:text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:[&_.sg-acc-icon]:text-foreground focus-visible:rounded-[var(--radius-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  lg ? "min-h-[68px] gap-8 py-5 text-base tracking-tight sm:min-h-[76px] sm:text-lg" : "min-h-12 gap-5 text-sm"
                )}
              >
                <span>{item.title}</span>
                <motion.span
                  className="sg-acc-icon inline-flex flex-none text-muted-foreground transition-colors duration-fast ease-out-quint group-data-[state=open]/acc:text-foreground"
                  initial={false}
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={reduced ? { duration: 0 } : spring.snappy}
                >
                  <ChevronDown size={17} aria-hidden="true" />
                </motion.span>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            {/* Radix keeps semantics and ids; motion owns the height so a toggle mid-flight retargets instead of restarting. */}
            <AccordionPrimitive.Content forceMount asChild>
              <motion.div className={cn("overflow-hidden text-muted-foreground", lg ? "text-sm leading-[1.65] sm:text-base" : "text-sm leading-relaxed")} initial={false} animate={open ? "open" : "closed"} variants={reduced ? panelStill : panelMotion}>
                <motion.div className={cn("[overflow-wrap:anywhere]", lg ? "max-w-[62ch] pr-6 pb-6 sm:pr-12" : "pr-8 pb-5")} variants={reduced ? contentStill : contentMotion}>{item.content}</motion.div>
              </motion.div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        );
      })}
    </AccordionPrimitive.Root>
  );
}
