import * as React from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Target } from "motion/react";
import { ChevronDown } from "lucide-react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard, fadeIn, fadeOut, rest } from "../../lib/motion";
import { menuContent, menuItem, menuItemDestructive } from "../../lib/menu";
import { iconKey, useMorphWidth } from "../../lib/morph";

export type ButtonGroupVariant = "outline" | "solid";
export type ButtonGroupSize = "sm" | "md";
export type ButtonGroupOrientation = "horizontal" | "vertical";

export interface ButtonGroupItem {
  /** Stable key for the segment. */
  id: string;
  /** Visible text and the accessible name. Changing it crossfades in place, so "Share" can answer "Copied". */
  label: string;
  /** Every other label this segment can show, such as ["Copied"]. The segment sizes to the widest, so a label change never resizes it. */
  reserve?: string[];
  icon?: React.ReactNode;
  /** Shows only the icon; the label becomes the accessible name and the tooltip. */
  iconOnly?: boolean;
  /** Visible content in place of the label, such as a live value. The label stays the accessible name. */
  content?: React.ReactNode;
  onSelect?: () => void;
  /** Renders the segment as a link. */
  href?: string;
  disabled?: boolean;
}

export interface ButtonGroupMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
  href?: string;
  disabled?: boolean;
  /** Colors the item as a destructive action. */
  destructive?: boolean;
}

export interface ButtonGroupMenu {
  /** Accessible name and tooltip of the chevron segment, such as "More actions". */
  label: string;
  items: ButtonGroupMenuItem[];
}

export interface ButtonGroupProps {
  items: ButtonGroupItem[];
  /** Adds a trailing chevron segment that opens these actions in a menu aligned to the group's edge. */
  menu?: ButtonGroupMenu;
  /** Accessible name of the group, such as "Document actions". */
  label: string;
  variant?: ButtonGroupVariant;
  size?: ButtonGroupSize;
  orientation?: ButtonGroupOrientation;
  /** When the row does not fit its container, segments with an icon drop their label and keep the icon. Horizontal only. */
  collapseLabels?: boolean;
  /** Disables every segment and the menu. */
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Key of the chevron segment. Plain text, because the HTML parser rewrites control characters in server-rendered attributes. */
const MENU = "button-group-menu";

const textIn: Target = { opacity: 0, y: 4, filter: `blur(${blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: -3, filter: `blur(${blur.soft}px)`, transition: { duration: duration.quick, ease: easeStandard } };

const tones = {
  outline: "",
  // Solid is the primary group: the primary fill, with the highlight and dividers mixed from the page color.
  solid: [
    "border-primary bg-primary text-primary-foreground",
    "[--bg-divider:color-mix(in_oklab,var(--color-background)_20%,var(--color-primary))]",
    "[--bg-highlight:color-mix(in_oklab,var(--color-background)_13%,var(--color-primary))]",
    "[--bg-highlight-pressed:color-mix(in_oklab,var(--color-background)_22%,var(--color-primary))]",
    "[--bg-muted-ink:color-mix(in_oklab,var(--color-background)_72%,var(--color-primary))]",
  ].join(" "),
} as const;

const sizes = {
  sm: "[--bg-h:32px] [--bg-pad-x:12px] [--bg-divider-inset:9px]",
  md: "[--bg-h:40px]",
} as const;

/**
 * Icon and label of one segment. Every reserved label sits invisibly in the same grid cell, so the segment is as wide as its widest
 * state and a new label crossfades inside a fixed box: it rises in from a soft blur while the old one lifts away. A label nobody
 * reserved still never snaps: the slot springs to its width.
 */
function SegmentContent({ item, reduced }: { item: ButtonGroupItem; reduced: boolean }) {
  const contentRef = React.useRef<HTMLSpanElement>(null);
  const key = `${iconKey(item.icon)}|${item.content !== undefined ? "\u0000content" : item.iconOnly ? "" : item.label}`;
  const width = useMorphWidth(contentRef, key, reduced);
  const sizers = item.iconOnly || item.content !== undefined ? [] : [...new Set([item.label, ...(item.reserve ?? [])])];
  const phase = "inline-flex items-center gap-2 whitespace-nowrap group-data-[size=sm]/bg:gap-1.5";
  const label = "inline-block group-data-[compact]/bg:data-[collapsible]:hidden";
  return (
    <motion.span className="relative inline-flex min-w-0 items-center justify-center data-[morphing]:[clip-path:inset(-50%_-.75rem)]" style={{ width }} aria-hidden="true">
      <span ref={contentRef} className="inline-grid flex-none items-center justify-items-center [&>*]:[grid-area:1/1]">
        {sizers.map((text) => (
          <span key={text} className={cn(phase, "invisible pointer-events-none")}>
            {item.icon ? <span className="inline-block size-4 flex-none" /> : null}
            <span className={label} data-collapsible={item.icon ? "" : undefined}>{text}</span>
          </span>
        ))}
        <AnimatePresence initial={false}>
          <motion.span
            key={key}
            className={phase}
            initial={reduced ? fadeIn : textIn}
            animate={rest}
            exit={reduced ? fadeOut : textOut}
            transition={reduced ? { duration: duration.instant } : { duration: duration.standard, ease: easeEnter }}
          >
            {item.icon ? <span className="inline-flex flex-none [&_svg]:size-4 [&_svg]:stroke-[1.75]">{item.icon}</span> : null}
            {item.content !== undefined ? (
              <span className="inline-flex items-center tabular-nums">{item.content}</span>
            ) : item.iconOnly ? null : (
              <span className={label} data-collapsible={item.icon ? "" : undefined}>{item.label}</span>
            )}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.span>
  );
}

const inside = (node: HTMLElement, x: number, y: number) => {
  const rect = node.getBoundingClientRect();
  return x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom;
};
/** Segments are found by their data-key, so the group needs no ref per segment. */
const segmentsIn = (root: HTMLElement | null) => Array.from(root?.querySelectorAll<HTMLElement>(":scope > [data-key]") ?? []);
const segmentIn = (root: HTMLElement | null, key: string | null) => (key === null ? undefined : segmentsIn(root).find((node) => node.dataset.key === key));
/** The segment's box inside the group at sub-pixel precision, undoing any scale an ancestor applies. */
function boxOf(group: HTMLElement, node: HTMLElement) {
  const outer = group.getBoundingClientRect();
  const inner = node.getBoundingClientRect();
  // offsetWidth is rounded to whole pixels, so only a real transform (more than a pixel apart) counts as scale.
  const scale = group.offsetWidth && Math.abs(outer.width - group.offsetWidth) > 1 ? outer.width / group.offsetWidth : 1;
  return [(inner.left - outer.left) / scale - group.clientLeft + group.scrollLeft, (inner.top - outer.top) / scale - group.clientTop + group.scrollTop, inner.width / scale, inner.height / scale];
}
const inert = (node: HTMLElement) => (node as HTMLButtonElement).disabled || node.getAttribute("aria-disabled") === "true";

const segmentBase = [
  "group/seg relative z-1 inline-flex flex-none min-w-[calc(var(--bg-h)-2px)] h-[calc(var(--bg-h)-2px)] items-center justify-center",
  "m-0 px-[var(--bg-pad-x)] border-0 rounded-none bg-transparent text-inherit font-[inherit] text-sm font-medium tracking-[-0.01em] leading-none",
  "whitespace-nowrap no-underline cursor-pointer select-none [-webkit-tap-highlight-color:transparent]",
  "aria-disabled:cursor-not-allowed disabled:cursor-not-allowed",
  "group-data-[orientation=vertical]/bg:w-full group-data-[orientation=vertical]/bg:justify-start",
  "group-data-[compact]/bg:data-[collapsible]:w-[calc(var(--bg-h)-2px)] group-data-[compact]/bg:data-[collapsible]:px-0",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
].join(" ");
const iconOnlySegment = "w-[calc(var(--bg-h)-2px)] px-0 group-data-[orientation=vertical]/bg:justify-center";
const triggerSegment = "w-[calc(var(--bg-h)-6px)] min-w-0 px-0 text-[var(--bg-muted-ink)] transition-colors duration-[var(--duration-quick)] data-[state=open]:text-inherit group-data-[orientation=vertical]/bg:justify-center";
/** The press answers inside the segment: content dips and springs back, the group and its neighbours stay still. */
const contentBase = [
  "relative inline-flex items-center",
  "[transition:transform_var(--duration-spring)_var(--ease-spring),opacity_var(--duration-quick)_var(--ease-out-quint)]",
  "group-active/seg:[transition-duration:var(--duration-instant)] group-active/seg:[transition-timing-function:var(--ease-out-quint)]",
  "group-aria-disabled/seg:opacity-40 motion-reduce:!transform-none motion-reduce:transition-none",
].join(" ");

/** Hairline divider on a segment's leading edge. It fades where the highlight arrives, so the highlight never sits beside a line. */
function Divider({ vertical }: { vertical: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute bg-[var(--bg-divider)] transition-opacity duration-[var(--duration-quick)] group-data-[quiet]/seg:opacity-0 motion-reduce:transition-none",
        vertical
          ? "top-[-.5px] right-[var(--bg-divider-inset)] left-[var(--bg-divider-inset)] h-px"
          : "top-[var(--bg-divider-inset)] bottom-[var(--bg-divider-inset)] left-[-.5px] w-px"
      )}
    />
  );
}

/**
 * Related actions joined into one surface: a shared border and radius, hairline dividers, no gaps. One soft highlight glides
 * between segments under the pointer or keyboard focus, the pressed segment answers in place, and an optional chevron
 * segment opens more actions in a menu aligned to the group's edge.
 */
export function ButtonGroup({ items, menu, label, variant = "outline", size = "md", orientation = "horizontal", collapseLabels = true, disabled = false, className, style }: ButtonGroupProps) {
  const reduced = useReducedMotion() ?? false;
  const root = React.useRef<HTMLDivElement>(null);
  const vertical = orientation === "vertical";

  // The highlight sits on the pointer's segment, else the pressed one (touch), else the open menu's chevron, else keyboard focus.
  const [hover, setHover] = React.useState<string | null>(null);
  const [pressed, setPressed] = React.useState<string | null>(null);
  const [focused, setFocused] = React.useState<string | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const active = hover ?? pressed ?? (menuOpen ? MENU : null) ?? focused;
  const keys = [...items.map((item) => item.id), ...(menu ? [MENU] : [])];
  const activeIndex = active ? keys.indexOf(active) : -1;
  const inertKey = `${disabled}${items.map((item) => (item.disabled ? 1 : 0)).join("")}`;

  const x = useMotionValue(0), y = useMotionValue(0), width = useMotionValue(0), height = useMotionValue(0), opacity = useMotionValue(0);
  const shown = React.useRef<string | null>(null);

  React.useLayoutEffect(() => {
    const node = segmentIn(root.current, active);
    // Hovering a disabled segment shows nothing; focus on one still shows where the keyboard is.
    if (!node || (inert(node) && active !== focused)) {
      if (shown.current) animate(opacity, 0, { duration: reduced ? duration.instant : duration.quick, ease: easeStandard });
      shown.current = null;
      return;
    }
    const target = boxOf(root.current!, node);
    const values = [x, y, width, height];
    if (!shown.current || reduced) {
      // Arriving from nowhere, it appears in place; only moves between segments travel.
      values.forEach((value, index) => value.jump(target[index]));
      animate(opacity, 1, { duration: reduced ? duration.instant : duration.quick, ease: easeStandard });
    } else {
      values.forEach((value, index) => animate(value, target[index], spring.snappy));
      animate(opacity, 1, { duration: duration.quick });
    }
    shown.current = active;
    // inertKey re-checks a segment that turns disabled under a still pointer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, inertKey, reduced, x, y, width, height, opacity]);

  // Segments resize when a label morphs or labels collapse; the highlight stays locked to its segment.
  const keyList = keys.join("\u0000");
  React.useEffect(() => {
    const group = root.current;
    if (!group || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const node = segmentIn(group, shown.current);
      if (!node) return;
      const target = boxOf(group, node);
      [x, y, width, height].forEach((value, index) => {
        if (Math.abs(value.get() - target[index]) < 0.01) return;
        if (value.isAnimating() && !reduced) animate(value, target[index], spring.snappy);
        else value.jump(target[index]);
      });
    });
    observer.observe(group);
    segmentsIn(group).forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [keyList, reduced, x, y, width, height]);

  // Labels collapse to icons when the row overflows, and come back once the container is wide enough for the full row again.
  const [overflowing, setCompact] = React.useState(false);
  const fullWidth = React.useRef(0);
  const blockedAt = React.useRef(0);
  const collapsible = collapseLabels && !vertical && items.some((item) => item.icon && !item.iconOnly && item.content === undefined);
  const compact = collapsible && overflowing;
  React.useEffect(() => {
    const group = root.current;
    const parent = group?.parentElement;
    if (!group || !parent || !collapsible || typeof ResizeObserver === "undefined") return;
    const check = () => {
      const box = getComputedStyle(parent);
      const available = parent.clientWidth - parseFloat(box.paddingLeft) - parseFloat(box.paddingRight);
      if (group.dataset.compact === undefined) {
        if (group.scrollWidth > group.clientWidth + 1) { fullWidth.current = group.scrollWidth + 2; blockedAt.current = available; setCompact(true); }
      } else if (available > blockedAt.current && available >= fullWidth.current) setCompact(false);
    };
    const observer = new ResizeObserver(check);
    observer.observe(group);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [collapsible, keyList]);

  // Pressing tracks the segment under the finger, so touch gets the same highlight a pointer gets on hover.
  React.useEffect(() => {
    if (!pressed) return;
    const release = () => setPressed(null);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => { window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", release); };
  }, [pressed]);

  const hit = (event: React.PointerEvent) => {
    for (const node of segmentsIn(root.current)) if (inside(node, event.clientX, event.clientY)) return inert(node) ? null : node.dataset.key ?? null;
    return null;
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => { if (event.pointerType !== "touch") setHover(hit(event)); };
  const onPointerLeave = () => setHover(null);
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => { if (event.button === 0) setPressed(hit(event)); };

  // Keyboard focus shows the highlight; a mouse click focuses without it, so nothing stays lit after the pointer leaves.
  const onFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const key = target.dataset.key;
    if (key === undefined) return;
    let visible = true;
    try { visible = target.matches(":focus-visible"); } catch { /* older engines */ }
    setFocused(visible ? key : null);
  };
  const onBlur = (event: React.FocusEvent<HTMLDivElement>) => { if (!root.current?.contains(event.relatedTarget as Node | null)) setFocused(null); };

  // Tab visits every segment in order; arrow keys along the orientation, Home and End also move between them.
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) return;
    // Disabled segments stay focusable (aria-disabled), so the keyboard can find them and hear why nothing happens.
    const list = segmentsIn(root.current).filter((node) => !(node as HTMLButtonElement).disabled);
    const index = list.findIndex((node) => node === document.activeElement);
    if (index < 0) return;
    const rtl = !vertical && getComputedStyle(root.current!).direction === "rtl";
    const forward = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    const backward = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    const last = list.length - 1;
    const target = event.key === forward ? (index === last ? 0 : index + 1) : event.key === backward ? (index === 0 ? last : index - 1) : event.key === "Home" ? 0 : event.key === "End" ? last : -1;
    if (target < 0) return;
    event.preventDefault();
    list[target].focus();
  };

  // A label that changes right after its segment is pressed, such as "Copied", is announced once; the quiet revert is not.
  const [announcement, setAnnouncement] = React.useState("");
  const labels = React.useRef<Map<string, string> | null>(null);
  const activated = React.useRef({ key: "", at: 0 });
  const labelList = items.map((item) => `${item.id}\u0000${item.label}`).join("\u0001");
  React.useEffect(() => {
    const previous = labels.current;
    labels.current = new Map(items.map((item) => [item.id, item.label]));
    if (!previous) return;
    const recent = performance.now() - activated.current.at < 1000;
    const changed = items.filter((item) => recent && item.id === activated.current.key && previous.has(item.id) && previous.get(item.id) !== item.label && item.content === undefined);
    if (changed.length) setAnnouncement(changed.map((item) => item.label).join(", "));
    // labelList carries the only part of items this effect reads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labelList]);

  const select = (item: ButtonGroupItem) => { activated.current = { key: item.id, at: performance.now() }; item.onSelect?.(); };
  const quiet = (index: number) => (activeIndex >= 0 && (index === activeIndex || index === activeIndex + 1) ? "" : undefined);

  const segments = items.map((item, index) => {
    const off = item.disabled && !disabled;
    const named = item.iconOnly || item.content !== undefined || (compact && !!item.icon);
    const common = {
      className: cn(segmentBase, item.iconOnly && iconOnlySegment),
      "data-key": item.id,
      "data-quiet": quiet(index),
      "data-collapsible": item.icon && !item.iconOnly && item.content === undefined ? "" : undefined,
      "aria-label": named ? item.label : undefined,
      title: item.iconOnly || (compact && item.icon) ? item.label : undefined,
    };
    const body = (
      <>
        {index > 0 ? <Divider vertical={vertical} /> : null}
        <span className={cn(contentBase, item.iconOnly ? "group-active/seg:scale-90" : "group-active/seg:scale-[.97]")}>
          <SegmentContent item={item} reduced={reduced} />
        </span>
        {named ? null : <span className="sr-only">{item.label}</span>}
      </>
    );
    if (item.href && !off && !disabled) return <a key={item.id} {...common} href={item.href} onClick={() => select(item)}>{body}</a>;
    return <button key={item.id} {...common} type="button" disabled={disabled} aria-disabled={off || undefined} onClick={off ? undefined : () => select(item)}>{body}</button>;
  });

  const group = (
    <div
      ref={root}
      className={cn(
        "group/bg relative isolate inline-flex max-w-full items-stretch overflow-x-auto overscroll-x-contain align-middle [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "border border-border rounded-[var(--bg-radius)] bg-surface text-foreground aria-disabled:opacity-50",
        "[--bg-h:40px] [--bg-pad-x:14px] [--bg-inset:3px] [--bg-radius:var(--radius-lg)] [--bg-divider:var(--color-border)] [--bg-divider-inset:11px]",
        "[--bg-highlight:var(--color-muted)] [--bg-highlight-pressed:color-mix(in_oklab,var(--color-muted),var(--color-border-strong)_30%)] [--bg-muted-ink:var(--color-muted-foreground)]",
        sizes[size],
        tones[variant],
        vertical && "flex-col overflow-visible [--bg-divider-inset:10px]",
        className
      )}
      style={style}
      role="group"
      aria-label={label}
      aria-disabled={disabled || undefined}
      data-orientation={orientation}
      data-size={size}
      data-compact={compact ? "" : undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      {/* The travelling highlight. Motion sets its box to the active segment; the visible shape sits inset so the border stays crisp. */}
      <motion.span
        className={cn(
          "pointer-events-none absolute top-0 left-0 z-0",
          "before:absolute before:inset-[var(--bg-inset)] before:rounded-[calc(var(--bg-radius)-var(--bg-inset)-1px)] before:bg-[var(--bg-highlight)] before:content-['']",
          "before:transition-colors before:duration-[var(--duration-quick)] data-[pressed]:before:bg-[var(--bg-highlight-pressed)] data-[pressed]:before:duration-[var(--duration-instant)]"
        )}
        style={{ x, y, width, height, opacity }}
        data-pressed={pressed && pressed === active ? "" : undefined}
        aria-hidden="true"
      />
      {segments}
      {menu ? (
        <DropdownPrimitive.Trigger
          className={cn(segmentBase, triggerSegment)}
          data-key={MENU}
          data-quiet={quiet(items.length)}
          aria-label={menu.label}
          title={menu.label}
          disabled={disabled}
        >
          {items.length > 0 ? <Divider vertical={vertical} /> : null}
          {/* The chevron anchors the menu, so it answers with the deeper highlight only. */}
          <span className="relative inline-flex items-center">
            <ChevronDown className="size-4 [transition:transform_var(--duration-spring)_var(--ease-spring)] group-data-[state=open]/seg:rotate-180 motion-reduce:transition-none" strokeWidth={1.75} aria-hidden="true" />
          </span>
        </DropdownPrimitive.Trigger>
      ) : null}
      <span className="sr-only" aria-live="polite">{announcement}</span>
    </div>
  );

  if (!menu) return group;
  // Non-modal: no scroll lock, so opening the menu never shifts the page by a scrollbar's width.
  return (
    <DropdownPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
      {group}
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content className={menuContent} side="bottom" align={vertical ? "start" : "end"} alignOffset={-1} sideOffset={6} collisionPadding={12} loop>
          {menu.items.map((action, index) => {
            const itemClass = cn(menuItem, action.destructive && menuItemDestructive);
            const body = (
              <>
                {action.icon ? <span className={cn("inline-flex flex-none text-muted-foreground [&_svg]:size-4 [&_svg]:stroke-[1.75]", action.destructive && "text-destructive")} aria-hidden="true">{action.icon}</span> : null}
                <span className="min-w-0 truncate">{action.label}</span>
              </>
            );
            const itemStyle = { "--i": index } as React.CSSProperties;
            return action.href ? (
              <DropdownPrimitive.Item key={action.id} className={itemClass} style={itemStyle} disabled={action.disabled} onSelect={action.onSelect} asChild>
                <a href={action.href}>{body}</a>
              </DropdownPrimitive.Item>
            ) : (
              <DropdownPrimitive.Item key={action.id} className={itemClass} style={itemStyle} disabled={action.disabled} onSelect={action.onSelect}>{body}</DropdownPrimitive.Item>
            );
          })}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}
