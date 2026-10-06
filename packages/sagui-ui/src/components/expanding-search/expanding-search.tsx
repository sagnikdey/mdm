import * as React from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import type { MotionValue } from "motion/react";
import { Search, X } from "lucide-react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { adornmentButton } from "../../lib/field";
import { easeEnter, easeStandard } from "../../lib/motion";

export interface ExpandingSearchItem {
  id: string;
  title: string;
  /** One short line under the title, such as the type, owner, or last edit. */
  meta?: string;
  /** Results gather under this heading, in the order groups first appear in `items`. */
  group?: string;
  icon?: React.ReactNode;
  /** Extra words that should also find this item. */
  keywords?: string[];
}

/**
 * A search that waits as an icon button until it is needed. Use it in headers and toolbars where a full field would crowd the layout.
 * The button morphs into the field, results unfold beneath it, and Escape, choosing a result, or leaving the field empty folds it back into the icon.
 * Place it in the space the field may grow into; it fills that space's width and keeps the button on the `anchor` edge.
 */
export interface ExpandingSearchProps {
  /** Names the button, the field, and the results, such as "Search projects and docs". */
  label: string;
  items: ExpandingSearchItem[];
  /** Shown before anything is typed, such as recent searches. */
  suggestions?: ExpandingSearchItem[];
  suggestionsLabel?: string;
  placeholder?: string;
  onSelect?: (item: ExpandingSearchItem) => void;
  onExpandedChange?: (expanded: boolean) => void;
  /** The widest the field grows. It never grows past its container. */
  expandedWidth?: number;
  maxResults?: number;
  /** The edge the button sits on; the field grows away from it. */
  anchor?: "start" | "end";
  /** A short tip under the empty state. */
  emptyHint?: string;
  className?: string;
}

type Group = { name: string; items: ExpandingSearchItem[] };
type Mode = "suggestions" | "results" | "empty";

const FALLBACK_SIZE = 40;

/** Title starts beat word starts, which beat matches inside a word, which beat keyword and meta matches. Ties keep the original order. */
function rank(items: ExpandingSearchItem[], query: string, limit: number) {
  const q = query.toLocaleLowerCase();
  const scored: { item: ExpandingSearchItem; score: number; order: number }[] = [];
  items.forEach((item, order) => {
    const title = item.title.toLocaleLowerCase();
    const at = title.indexOf(q);
    const extra = [item.meta ?? "", ...(item.keywords ?? [])].some((word) => word.toLocaleLowerCase().includes(q));
    const score = at === 0 ? 0 : at > 0 && /[\s\-/]/.test(title[at - 1]) ? 1 : at > 0 ? 2 : extra ? 3 : -1;
    if (score >= 0) scored.push({ item, score, order });
  });
  return scored.sort((a, b) => a.score - b.score || a.order - b.order).slice(0, limit).map((entry) => entry.item);
}

function groupBy(list: ExpandingSearchItem[], source: ExpandingSearchItem[]): Group[] {
  const order = new Map<string, number>();
  source.forEach((item, index) => { const name = item.group ?? ""; if (!order.has(name)) order.set(name, index); });
  const groups = new Map<string, ExpandingSearchItem[]>();
  list.forEach((item) => { const name = item.group ?? ""; groups.set(name, [...(groups.get(name) ?? []), item]); });
  return [...groups].sort((a, b) => (order.get(a[0]) ?? 0) - (order.get(b[0]) ?? 0)).map(([name, items]) => ({ name, items }));
}

function Match({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<mark className="bg-transparent font-medium text-foreground">{text.slice(at, at + query.length)}</mark>{text.slice(at + query.length)}</>;
}

/** The panel shares the field's width value, so on first open it unfolds out of the field; afterwards only its height follows the content. */
function Panel({ width, reduced, children }: { width: MotionValue<number>; reduced: boolean; children: React.ReactNode }) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const height = useMotionValue(0);
  React.useLayoutEffect(() => {
    const panel = panelRef.current;
    const body = bodyRef.current;
    if (!panel || !body || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const next = body.offsetHeight + panel.offsetHeight - panel.clientHeight;
      if (reduced) height.jump(next);
      else animate(height, next, spring.smooth);
    });
    observer.observe(body);
    return () => observer.disconnect();
  }, [height, reduced]);
  // Reduced motion skips the unfold: the panel is its content's height from the first frame and only fades.
  return (
    <motion.div
      ref={panelRef}
      className="pointer-events-auto absolute top-[calc(100%+8px)] right-0 z-40 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-floating group-data-[anchor=start]/esr:right-auto group-data-[anchor=start]/esr:left-0"
      style={{ width, height: reduced ? "auto" : height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: reduced ? 0.15 : duration.quick, ease: easeEnter } }}
      exit={{ opacity: 0, transition: { duration: reduced ? 0.1 : duration.instant, ease: easeStandard } }}
    >
      <div ref={bodyRef} className="relative max-h-[min(22rem,60vh)] w-[calc(var(--es-width,360px)-2px)] overflow-x-hidden overflow-y-auto overscroll-contain p-1.5 [scrollbar-width:thin]">{children}</div>
    </motion.div>
  );
}

/** Offsets ignore transforms, so they describe where rows sit in the list, not where a gliding row happens to be mid-flight. */
function offsetWithin(node: HTMLElement, container: HTMLElement) {
  let top = 0;
  let current: HTMLElement | null = node;
  while (current && current !== container) { top += current.offsetTop; current = current.offsetParent as HTMLElement | null; }
  return top;
}

interface ListboxProps {
  id: string;
  label: string;
  groups: Group[];
  query: string;
  activeIndex: number;
  optionId: (item: ExpandingSearchItem) => string;
  reduced: boolean;
  keyboard: React.RefObject<boolean>;
  onHover: (index: number) => void;
  onChoose: (item: ExpandingSearchItem) => void;
}

function Listbox({ id, label, groups, query, activeIndex, optionId, reduced, keyboard, onHover, onChoose }: ListboxProps) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const flat = groups.flatMap((group) => group.items);
  const layoutKey = flat.map((item) => item.id).join("|");
  const activeItem = flat[activeIndex];
  const activeId = activeItem ? optionId(activeItem) : "";
  /** The highlight lives inside the active row, so it rides that row wherever it glides. Moving to another row, it starts where the old one was and springs home. */
  const travel = useMotionValue(0);
  const fade = useMotionValue(1);
  const last = React.useRef<{ id: string; set: string; top: number } | null>(null);

  React.useLayoutEffect(() => {
    const list = listRef.current;
    const row = activeId ? document.getElementById(activeId) : null;
    if (!list || !row) { last.current = null; return; }
    const top = offsetWithin(row, list);
    const previous = last.current;
    last.current = { id: activeId, set: layoutKey, top };
    // Same row: its highlight is already in place, and any travel still in flight stays relative to it.
    if (previous?.id === activeId) return;
    if (previous && previous.set === layoutKey && !reduced) {
      const velocity = travel.getVelocity();
      travel.jump(previous.top + travel.get() - top);
      animate(travel, 0, { ...spring.snappy, velocity });
    } else {
      // Nothing was highlighted, or new results arrived: it fades in on its row, without travel.
      travel.jump(0);
      if (reduced) fade.jump(1);
      else { fade.jump(0); animate(fade, 1, { duration: duration.instant, ease: easeEnter }); }
    }
    if (keyboard.current) row.scrollIntoView({ block: "nearest" });
  }, [activeId, layoutKey, reduced, travel, fade, keyboard]);

  return (
    <div ref={listRef} id={id} role="listbox" aria-label={label} className="relative isolate flex flex-col gap-1">
      <AnimatePresence mode="popLayout" initial={false}>
        {groups.map((group) => {
          const headingId = `${id}-${group.name || "results"}`.replace(/\s+/g, "-");
          return (
            <motion.div
              key={group.name}
              role="group"
              aria-labelledby={group.name ? headingId : undefined}
              className="relative"
              layout={reduced ? false : "position"}
              layoutDependency={layoutKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
              transition={{ opacity: { duration: duration.quick, ease: easeEnter }, layout: spring.smooth }}
            >
              {group.name && <div id={headingId} className="px-3 pt-2 pb-1 text-xs font-medium leading-snug text-muted-foreground" role="presentation">{group.name}</div>}
              <AnimatePresence mode="popLayout" initial={false}>
                {group.items.map((item) => {
                  const position = flat.indexOf(item);
                  const active = position === activeIndex;
                  return (
                    <motion.div
                      key={item.id}
                      id={optionId(item)}
                      role="option"
                      aria-selected={active}
                      data-active={active || undefined}
                      className="group/option relative flex min-h-12 cursor-pointer select-none items-center gap-3 rounded-[calc(var(--radius-xl)-6px)] px-3 py-1.5 text-foreground [-webkit-tap-highlight-color:transparent]"
                      layout={reduced ? false : "position"}
                      layoutDependency={layoutKey}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.08 } }}
                      transition={{ opacity: { duration: duration.quick, ease: easeEnter }, layout: spring.smooth }}
                      onPointerMove={() => { if (!active) { keyboard.current = false; onHover(position); } }}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onChoose(item)}
                    >
                      {/* The highlight paints under every row's content, so text never hides while it travels. */}
                      {active && <motion.span className="pointer-events-none absolute inset-0 -z-1 rounded-[inherit] bg-[color-mix(in_oklab,var(--color-foreground)_6%,transparent)]" style={{ y: travel, opacity: fade }} aria-hidden="true" />}
                      {item.icon && <span className="grid w-[18px] flex-none place-items-center text-muted-foreground transition-colors duration-[var(--duration-quick)] group-data-[active]/option:text-foreground motion-reduce:transition-none" aria-hidden="true">{item.icon}</span>}
                      <span className="grid min-w-0">
                        <span className="truncate text-sm leading-snug text-foreground"><Match text={item.title} query={query} /></span>
                        {item.meta && <span className="truncate text-xs leading-snug text-muted-foreground">{item.meta}</span>}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function ExpandingSearch({ label, items, suggestions = [], suggestionsLabel = "Recent", placeholder, onSelect, onExpandedChange, expandedWidth = 360, maxResults = 6, anchor = "end", emptyHint = "Try a shorter word or check the spelling.", className }: ExpandingSearchProps) {
  const id = React.useId();
  const reduced = useReducedMotion() ?? false;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const shellRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(-1);
  const open = React.useRef(false);
  const size = React.useRef({ collapsed: FALLBACK_SIZE, expanded: expandedWidth });
  const width = useMotionValue(FALLBACK_SIZE);
  /** True while the last highlight move came from the keyboard, so only keyboard moves scroll the list. */
  const keyboard = React.useRef(false);

  // The corner radius follows the width: a circle while collapsed, the control radius once open. It rides the same spring, so the two never drift apart.
  const syncShape = React.useCallback((value: number) => {
    const { collapsed, expanded: full } = size.current;
    shellRef.current?.style.setProperty("--es-open", String(Math.min(1, Math.max(0, (value - collapsed) / Math.max(1, full - collapsed)))));
  }, []);
  useMotionValueEvent(width, "change", syncShape);

  // The field grows to its own limit or its container, whichever is smaller. Container resizes are followed at once; they are not the person's action.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const shell = shellRef.current;
    if (!root || !shell) return;
    const measure = () => {
      const collapsed = shell.offsetHeight || FALLBACK_SIZE;
      const full = Math.max(collapsed, Math.min(expandedWidth, root.clientWidth));
      size.current = { collapsed, expanded: full };
      root.style.setProperty("--es-width", `${full}px`);
      const goal = open.current ? full : collapsed;
      if (width.isAnimating()) animate(width, goal, spring.morph);
      else width.jump(goal);
      syncShape(width.get());
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [expandedWidth, width, syncShape]);

  // Opening grows on the morph spring with a hint of overshoot; folding back settles without one, so the circle never dips below its own size.
  const morphTo = (goal: number) => {
    if (reduced) width.jump(goal);
    else animate(width, goal, goal >= width.get() ? spring.morph : spring.smooth);
  };

  // Focus moves inside the same click, so touch keyboards open; the field is inert until this flush makes it focusable.
  function expand() {
    if (open.current) return;
    open.current = true;
    flushSync(() => { setExpanded(true); setFocused(true); });
    inputRef.current?.focus({ preventScroll: true });
    morphTo(size.current.expanded);
    onExpandedChange?.(true);
  }

  function collapse(returnFocus: boolean) {
    if (!open.current) return;
    open.current = false;
    flushSync(() => { setExpanded(false); setFocused(false); setQuery(""); setActive(-1); });
    if (returnFocus) buttonRef.current?.focus({ preventScroll: true });
    morphTo(size.current.collapsed);
    onExpandedChange?.(false);
  }

  const trimmed = query.trim();
  const results = React.useMemo(() => (trimmed ? rank(items, trimmed, maxResults) : []), [items, trimmed, maxResults]);
  const mode: Mode | null = !trimmed ? (suggestions.length ? "suggestions" : null) : results.length ? "results" : "empty";
  const groups = React.useMemo<Group[]>(
    () => (mode === "suggestions" ? [{ name: suggestionsLabel, items: suggestions }] : mode === "results" ? groupBy(results, items) : []),
    [mode, suggestions, suggestionsLabel, results, items]
  );
  const flat = groups.flatMap((group) => group.items);
  const activeIndex = Math.min(active, flat.length - 1);
  const activeItem = flat[activeIndex];
  const optionId = (item: ExpandingSearchItem) => `${id}-${mode}-${item.id}`;
  const listboxId = `${id}-${mode}-listbox`;
  const panelOpen = expanded && focused && mode !== null;
  const announcement = !panelOpen
    ? ""
    : mode === "empty"
      ? `No results for ${trimmed}`
      : mode === "results"
        ? `${flat.length} ${flat.length === 1 ? "result" : "results"}`
        : `${flat.length} ${suggestionsLabel.toLocaleLowerCase()} ${flat.length === 1 ? "item" : "items"}`;

  function choose(item: ExpandingSearchItem) {
    collapse(true);
    onSelect?.(item);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") { event.preventDefault(); collapse(true); return; }
    if (!panelOpen || !flat.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      keyboard.current = true;
      setActive(activeIndex < 0 ? (step > 0 ? 0 : flat.length - 1) : (activeIndex + step + flat.length) % flat.length);
    } else if (event.key === "Enter" && activeItem) {
      event.preventDefault();
      choose(activeItem);
    }
  }

  const clearHidden = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: `blur(${blur.subtle}px)` };

  return (
    // The root is the lane the field may grow into. Only the shell and the panel take pointer events, so an idle lane never blocks what sits under it.
    <div ref={rootRef} className={cn("group/esr pointer-events-none relative h-10 w-full min-w-10 [--es-h:40px]", className)} data-anchor={anchor}>
      {/* One shell is both the button and the field. Its width rides a spring and its radius follows the width, from a circle to the control radius. */}
      <motion.div
        ref={shellRef}
        className={cn(
          "pointer-events-auto absolute top-0 right-0 h-full overflow-hidden border border-border bg-surface text-muted-foreground",
          "rounded-[calc(var(--es-h)/2-(var(--es-h)/2-var(--radius-md))*var(--es-open,0))]",
          "[transition:border-color_var(--duration-quick)_var(--ease-out-quint),background-color_var(--duration-quick)_var(--ease-out-quint),color_var(--duration-quick)_var(--ease-out-quint),box-shadow_var(--duration-standard)_var(--ease-out-quint),transform_var(--duration-spring)_var(--ease-spring)]",
          "group-data-[anchor=start]/esr:right-auto group-data-[anchor=start]/esr:left-0",
          "data-[expanded]:border-border-strong data-[expanded]:text-foreground",
          "has-[>button:focus-visible]:border-ring has-[>button:focus-visible]:text-foreground has-[>button:focus-visible]:ring-[3px] has-[>button:focus-visible]:ring-ring/25",
          "has-[>input:focus]:border-ring has-[>input:focus]:text-foreground has-[>input:focus]:ring-[3px] has-[>input:focus]:ring-ring/25",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:not-data-[expanded]:bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:not-data-[expanded]:text-foreground",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:data-[expanded]:not-has-[>input:focus]:border-foreground",
          // A compact press while it is still a button; the morph takes over on release.
          "not-data-[expanded]:has-[>button:active]:scale-[.97] not-data-[expanded]:has-[>button:active]:[transition-duration:var(--duration-quick),var(--duration-quick),var(--duration-quick),var(--duration-standard),var(--duration-instant)]",
          "motion-reduce:transition-none motion-reduce:has-[>button:active]:scale-100"
        )}
        data-expanded={expanded || undefined}
        style={{ width }}
      >
        <button ref={buttonRef} type="button" className="absolute inset-0 z-1 m-0 cursor-pointer rounded-[inherit] border-0 bg-transparent p-0 [-webkit-tap-highlight-color:transparent] focus-visible:outline-none" aria-label={label} hidden={expanded} onClick={expand} />
        {/* The glass sits at the leading edge, so it is centered in the circle and rides that edge to its place in the open field. */}
        <Search className="pointer-events-none absolute top-[calc(50%-9px)] left-[calc(var(--es-h)/2-10px)]" width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
        {/* The placeholder waits for the shape to start moving, then fades in; on close it leaves first. */}
        <motion.input
          ref={inputRef}
          className="absolute inset-0 m-0 size-full border-0 bg-transparent py-0 pr-10 pl-[38px] font-[inherit] text-sm tracking-[-0.01em] text-ellipsis text-foreground outline-none placeholder:text-muted-foreground placeholder:opacity-100 inert:pointer-events-none"
          type="text"
          role="combobox"
          inert={!expanded}
          value={query}
          placeholder={placeholder ?? label}
          aria-label={label}
          aria-expanded={panelOpen}
          aria-controls={panelOpen && mode !== "empty" ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={panelOpen && activeItem ? optionId(activeItem) : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          initial={false}
          animate={{ opacity: expanded ? 1 : 0 }}
          transition={expanded ? { duration: reduced ? 0.15 : 0.2, ease: easeEnter, delay: reduced ? 0 : 0.08 } : { duration: reduced ? 0.1 : 0.08, ease: easeStandard }}
          onChange={(event) => { const next = event.target.value; setQuery(next); setActive(next.trim() ? 0 : -1); keyboard.current = false; }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            // Switching windows keeps the search as it was; the field refocuses on return.
            if (typeof document !== "undefined" && !document.hasFocus()) return;
            setFocused(false);
            if (open.current && !inputRef.current?.value.trim()) collapse(false);
          }}
          onKeyDown={handleKeyDown}
        />
        <AnimatePresence initial={false}>
          {expanded && query && (
            <motion.button
              key="clear"
              type="button"
              tabIndex={-1}
              className={cn(adornmentButton, "absolute top-[calc(50%-14px)] right-[7px] z-1 size-7 rounded-full active:scale-100")}
              aria-label="Clear search"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => { setQuery(""); setActive(-1); inputRef.current?.focus({ preventScroll: true }); }}
              initial={clearHidden}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ ...clearHidden, transition: { duration: reduced ? 0.1 : duration.instant, ease: easeStandard } }}
              transition={reduced ? { duration: 0.15 } : { ...spring.snappy, opacity: { duration: duration.fast }, filter: { duration: duration.fast } }}
            >
              <X width={16} height={16} strokeWidth={1.75} aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {panelOpen && (
          <Panel key="panel" width={width} reduced={reduced}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={mode}
                className="relative"
                initial={reduced ? { opacity: 0 } : { opacity: 0, filter: `blur(${blur.subtle}px)` }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.1, ease: easeStandard } }}
                transition={{ duration: reduced ? 0.15 : duration.quick, ease: easeEnter }}
              >
                {mode === "empty" ? (
                  <div className="grid gap-0.5 px-3 pt-3 pb-3.5">
                    <p className="m-0 text-sm font-medium leading-snug text-foreground [overflow-wrap:anywhere]">No results for “{trimmed}”</p>
                    <p className="m-0 text-xs leading-snug text-muted-foreground">{emptyHint}</p>
                  </div>
                ) : (
                  <Listbox id={listboxId} label={mode === "suggestions" ? suggestionsLabel : `Results for ${trimmed}`} groups={groups} query={mode === "results" ? trimmed : ""} activeIndex={activeIndex} optionId={optionId} reduced={reduced} keyboard={keyboard} onHover={setActive} onChoose={choose} />
                )}
              </motion.div>
            </AnimatePresence>
          </Panel>
        )}
      </AnimatePresence>
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    </div>
  );
}
