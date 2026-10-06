import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { AnimatePresence, LayoutGroup, animate, motion, useReducedMotion } from "motion/react";
import type { AnimationPlaybackControls, Variants } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";

type RootProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;

interface TabsState {
  active: string;
  layoutId: string;
  direction: number;
  panelHeightRef: React.MutableRefObject<number | null>;
  leavingRectRef: React.MutableRefObject<DOMRect | null>;
}
const TabsContext = React.createContext<TabsState>({ active: "", layoutId: "", direction: 1, panelHeightRef: { current: null }, leavingRectRef: { current: null } });

/** Switches between related panels. The highlight glides between triggers and panels slide in the direction of travel. */
export function Tabs({ value, defaultValue, onValueChange, className, ...props }: RootProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const [direction, setDirection] = React.useState(1);
  const active = value ?? internal;
  const layoutId = React.useId();
  const root = React.useRef<HTMLDivElement>(null);
  const panelHeightRef = React.useRef<number | null>(null);
  const leavingRectRef = React.useRef<DOMRect | null>(null);
  function handleChange(next: string) {
    const frame = root.current;
    leavingRectRef.current = frame?.querySelector(':scope > [role="tabpanel"][data-state="active"]')?.getBoundingClientRect() ?? null;
    const order = frame
      ? Array.from(frame.querySelectorAll<HTMLElement>('[role="tab"][data-value]')).filter((tab) => tab.closest("[data-sg-tabs]") === frame).map((tab) => tab.dataset.value)
      : [];
    const from = order.indexOf(active);
    const to = order.indexOf(next);
    if (from >= 0 && to >= 0 && from !== to) setDirection(to > from ? 1 : -1);
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }
  return (
    <TabsContext.Provider value={{ active, layoutId, direction, panelHeightRef, leavingRectRef }}>
      <LayoutGroup id={layoutId}>
        <TabsPrimitive.Root {...props} ref={root} data-sg-tabs="" className={cn("relative", className)} value={active} onValueChange={handleChange} />
      </LayoutGroup>
    </TabsContext.Provider>
  );
}

const scrollButton = "absolute inset-y-0 z-[2] grid w-[33px] place-items-center border-0 bg-muted text-foreground focus-visible:outline-2 focus-visible:-outline-offset-3 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-0";

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  const { active } = React.useContext(TabsContext);
  const reduced = useReducedMotion();
  const shell = React.useRef<HTMLDivElement>(null);
  const viewport = React.useRef<HTMLDivElement>(null);
  const list = React.useRef<HTMLDivElement>(null);
  const [edges, setEdges] = React.useState({ overflow: false, left: false, right: false });
  const update = React.useCallback(() => {
    const frame = shell.current;
    const scroll = viewport.current;
    if (!frame || !scroll) return;
    const max = Math.max(0, scroll.scrollWidth - scroll.clientWidth);
    const next = { overflow: scroll.scrollWidth > frame.clientWidth + 1, left: scroll.scrollLeft > 1, right: scroll.scrollLeft < max - 1 };
    setEdges((previous) => (previous.overflow === next.overflow && previous.left === next.left && previous.right === next.right ? previous : next));
  }, []);
  const reveal = React.useCallback((tab: HTMLElement | null) => {
    const scroll = viewport.current;
    if (!scroll || !tab) return;
    const frame = scroll.getBoundingClientRect();
    const item = tab.getBoundingClientRect();
    const max = Math.max(0, scroll.scrollWidth - scroll.clientWidth);
    const left = frame.left + (scroll.scrollLeft > 1 ? 34 : 0);
    const right = frame.right - (scroll.scrollLeft < max - 1 ? 34 : 0);
    const delta = item.left < left ? item.left - left : item.right > right ? item.right - right : 0;
    if (delta) scroll.scrollBy({ left: delta, behavior: reduced ? "instant" : "smooth" });
  }, [reduced]);
  React.useLayoutEffect(() => {
    const frame = shell.current;
    const scroll = viewport.current;
    const content = list.current;
    if (!frame || !scroll || !content) return;
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    observer.observe(scroll);
    observer.observe(content);
    scroll.addEventListener("scroll", update, { passive: true });
    update();
    return () => { observer.disconnect(); scroll.removeEventListener("scroll", update); };
  }, [update]);
  React.useLayoutEffect(() => { reveal(list.current?.querySelector<HTMLElement>('[role="tab"][data-state="active"]') ?? null); }, [active, reveal]);
  const scrollTabs = (dir: number) => viewport.current?.scrollBy({ left: dir * (viewport.current?.clientWidth ?? 0) * 0.75, behavior: reduced ? "instant" : "smooth" });
  const mask = edges.left && edges.right
    ? "[mask-image:linear-gradient(to_right,transparent,black_35px,black_calc(100%-35px),transparent)]"
    : edges.left ? "[mask-image:linear-gradient(to_right,transparent,black_35px,black)]"
    : edges.right ? "[mask-image:linear-gradient(to_right,black,black_calc(100%-35px),transparent)]" : "";
  return (
    <div ref={shell} className="relative isolate inline-flex min-w-0 max-w-full items-center rounded-[var(--radius-lg)] border border-border bg-muted">
      {edges.overflow && <button type="button" className={cn(scrollButton, "left-0 rounded-l-[var(--radius-lg)]")} aria-label="Scroll tabs left" disabled={!edges.left} onClick={() => scrollTabs(-1)}><ChevronLeft size={17} aria-hidden="true" /></button>}
      <motion.div
        ref={viewport}
        layoutScroll
        className={cn("min-w-0 overflow-x-auto rounded-[inherit] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", mask)}
        onFocusCapture={(event) => { if (event.target instanceof HTMLElement && event.target.getAttribute("role") === "tab") reveal(event.target); }}
      >
        {/* The list owns the stacking context so the gliding highlight passes under every label. */}
        <TabsPrimitive.List {...props} ref={list} className={cn("isolate inline-flex w-max items-center gap-1 p-1", className)} />
      </motion.div>
      {edges.overflow && <button type="button" className={cn(scrollButton, "right-0 rounded-r-[var(--radius-lg)]")} aria-label="Scroll tabs right" disabled={!edges.right} onClick={() => scrollTabs(1)}><ChevronRight size={17} aria-hidden="true" /></button>}
    </div>
  );
}

export function TabsTrigger({ className, children, value, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  const { active } = React.useContext(TabsContext);
  const reduced = useReducedMotion();
  // The LayoutGroup in Tabs scopes the highlight to this instance, so it glides between triggers but never flies in from another tab set.
  return (
    <TabsPrimitive.Trigger
      {...props}
      value={value}
      data-value={value}
      className={cn(
        "relative inline-grid min-h-8 min-w-[5.5rem] flex-none cursor-pointer place-items-center whitespace-nowrap rounded-[calc(var(--radius-lg)-3px)] border-0 bg-transparent px-3 text-sm font-medium text-muted-foreground [-webkit-tap-highlight-color:transparent] transition-colors duration-[var(--duration-fast)] ease-out-quint [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground active:text-foreground data-[state=active]:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {active === value && (
        <motion.span
          className="absolute inset-0 -z-10 rounded-[inherit] border border-border bg-surface shadow-resting will-change-transform"
          layoutId="selection"
          layoutDependency={active}
          transition={reduced ? { duration: 0 } : spring.morph}
          aria-hidden="true"
        />
      )}
      <span className="relative z-[1]">{children}</span>
    </TabsPrimitive.Trigger>
  );
}

const panelMotion: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 8 }),
  center: { opacity: 1, x: 0, transition: { opacity: { duration: duration.standard, ease: easeEnter }, x: spring.smooth } as never },
  exit: (direction: number) => ({ opacity: 0, x: direction * -6, transition: { duration: duration.instant, ease: easeStandard } }),
};
/** Reduced motion: a short crossfade in place. Keys match panelMotion so server and client render identical styles. */
const panelFade: Variants = {
  enter: { opacity: 0, x: 0 },
  center: { opacity: 1, x: 0, transition: { duration: duration.instant } },
  exit: { opacity: 0, x: 0, transition: { duration: 0.1 } },
};

export function TabsContent({ className, value, forceMount, children, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  const { active, direction, panelHeightRef, leavingRectRef } = React.useContext(TabsContext);
  const reduced = useReducedMotion();
  const panel = React.useRef<HTMLDivElement>(null);
  const selected = active === value;
  // Positioned and margin-free while leaving, so an outgoing panel pops out exactly where it was.
  const classes = cn("mt-4 text-sm leading-relaxed text-muted-foreground data-[motion-pop-id]:mt-0 data-[state=inactive]:pointer-events-none focus-visible:rounded-[var(--radius-lg)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring [&[data-motion-pop-id]]:mt-0", className);
  // The incoming panel starts at the outgoing panel's height and settles at its own, so content below glides instead of jumping.
  React.useLayoutEffect(() => {
    const node = panel.current;
    if (!node || forceMount) return;
    if (!selected) {
      const before = leavingRectRef.current;
      const now = node.getBoundingClientRect();
      if (before) node.style.translate = `${before.left - now.left}px ${before.top - now.top}px`;
      node.inert = true;
      return;
    }
    node.style.translate = "";
    node.inert = false;
    const from = panelHeightRef.current;
    const to = node.offsetHeight;
    let controls: AnimationPlaybackControls | undefined;
    const release = () => { node.style.height = ""; node.style.overflow = ""; };
    if (from !== null && Math.abs(from - to) > 1 && !reduced) {
      if (to > from) node.style.overflow = "clip";
      controls = animate(node, { height: [from, to] }, { ...spring.smooth, onComplete: release } as never);
    }
    panelHeightRef.current = controls && from !== null ? from : to;
    const observer = new ResizeObserver(() => { panelHeightRef.current = node.offsetHeight; });
    observer.observe(node);
    return () => { observer.disconnect(); controls?.stop(); release(); };
  }, [selected, reduced, forceMount, panelHeightRef, leavingRectRef]);
  if (forceMount) return <TabsPrimitive.Content {...props} value={value} forceMount className={classes}>{children}</TabsPrimitive.Content>;
  return (
    <AnimatePresence initial={false} mode="popLayout" custom={direction}>
      {selected && (
        <TabsPrimitive.Content {...props} key={value} value={value} forceMount asChild>
          <motion.div ref={panel} className={classes} custom={direction} variants={reduced ? panelFade : panelMotion} initial="enter" animate="center" exit="exit">
            {children}
          </motion.div>
        </TabsPrimitive.Content>
      )}
    </AnimatePresence>
  );
}
