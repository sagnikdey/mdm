import * as React from "react";
import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  /** Runs when the crumb is chosen. Without an href the crumb renders as a button, for paths that live in local state. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}
export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  ariaLabel?: string;
  className?: string;
  /** Element used for crumbs with an `href`. Pass your router's Link, e.g. `next/link`. Defaults to `a`. */
  linkComponent?: React.ElementType;
}

/** Each crumb reserves the width of its medium weight label, so becoming the current page never shifts the path. */
const crumb = "inline-flex flex-col rounded-[7px] px-0.5 py-1 after:invisible after:pointer-events-none after:h-0 after:overflow-hidden after:font-medium after:select-none after:content-[attr(data-label)]";
const interactive = "text-muted-foreground underline decoration-transparent decoration-1 underline-offset-4 transition-[color,text-decoration-color] duration-fast ease-out-quint [@media(hover:hover)_and_(pointer:fine)]:hover:text-primary [@media(hover:hover)_and_(pointer:fine)]:hover:decoration-[color-mix(in_oklab,currentColor_45%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

/** Crumbs present on first render stay still; crumbs added later slide in from the path before them. */
export function Breadcrumb({ items, ariaLabel = "Breadcrumb", className, linkComponent: Link = "a" }: BreadcrumbProps) {
  const reduced = useReducedMotion() ?? false;
  const still = { duration: 0 };
  const path = items.map((item) => item.label).join("/");
  return (
    <nav aria-label={ariaLabel} className={className}>
      <ol className="relative m-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-0.5 p-0">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item, index) => {
            const current = index === items.length - 1;
            return (
              <motion.li
                key={`${item.label}-${index}`}
                className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm leading-relaxed text-muted-foreground"
                layout={reduced ? false : "position"}
                layoutDependency={path}
                initial={reduced ? false : { opacity: 0, x: -8, filter: `blur(${blur.subtle}px)` }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={reduced ? { opacity: 0, transition: still } : { opacity: 0, x: -4, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.instant, ease: easeStandard } }}
                transition={reduced ? still : ({ duration: duration.standard, ease: easeEnter, layout: spring.smooth } as never)}
              >
                {index > 0 && <ChevronRight size={16} strokeWidth={1.75} className="flex-none text-border-strong" aria-hidden="true" />}
                {!current && item.href ? (
                  <Link href={item.href} data-label={item.label} onClick={item.onClick} className={cn(crumb, interactive)}>{item.label}</Link>
                ) : !current && item.onClick ? (
                  <button type="button" data-label={item.label} onClick={item.onClick} className={cn(crumb, interactive, "m-0 cursor-pointer border-0 bg-transparent text-start [font:inherit] text-sm leading-[inherit]")}>{item.label}</button>
                ) : (
                  <span aria-current={current ? "page" : undefined} data-label={item.label} className={cn(crumb, current && "font-medium text-primary")}>{item.label}</span>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </nav>
  );
}
