import * as React from "react";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Target } from "motion/react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";
import { Tooltip } from "../tooltip/tooltip";

export type FloatingButtonGroupVariant = "muted" | "floating";
export type FloatingButtonGroupSize = "sm" | "md";
export type FloatingButtonGroupOrientation = "horizontal" | "vertical";

export interface FloatingButtonGroupAction {
  type?: "action";
  /** Stable key, also passed to onAction. */
  id: string;
  /** Visible label, and the accessible name when the item shows only its icon. */
  label: string;
  icon?: React.ReactNode;
  /** Shows only the icon. The label moves into a tooltip and the accessible name. Overrides the group's iconOnly. */
  iconOnly?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  /** Marks an action that switches a mode on, such as Present. Sets aria-pressed and keeps a quiet tint while on. */
  pressed?: boolean;
  /** A shortcut hint shown in the tooltip, such as "⌘Z". The component does not bind the key. */
  shortcut?: string;
  /** Other labels this item can switch to, such as ["Copied"] for Share. The button keeps the width of the widest, so a label change never moves anything. */
  reserveLabels?: readonly string[];
}

export interface FloatingButtonGroupSeparator {
  type: "separator";
  id?: string;
}

export type FloatingButtonGroupItem = FloatingButtonGroupAction | FloatingButtonGroupSeparator;

export interface FloatingButtonGroupProps {
  items: readonly FloatingButtonGroupItem[];
  /** Accessible name of the toolbar, such as "Board actions". */
  label: string;
  /** muted sits quietly on a page; floating raises the tray with the floating shadow for overlays such as a selection toolbar. */
  variant?: FloatingButtonGroupVariant;
  size?: FloatingButtonGroupSize;
  orientation?: FloatingButtonGroupOrientation;
  /** Shows every item as an icon only, with its label in a tooltip. Items with their own iconOnly win. */
  iconOnly?: boolean;
  /** Side of the item tooltips. Defaults to top for a row and right for a column. */
  tooltipSide?: "top" | "bottom" | "left" | "right";
  /** Called with the item id after the item's own onSelect. */
  onAction?: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const isAction = (item: FloatingButtonGroupItem): item is FloatingButtonGroupAction => item.type !== "separator";

const rest: TargetAndTransition = { opacity: 1, y: 0, filter: "blur(0px)" };
const textIn: Target = { opacity: 0, y: 4, filter: `blur(${blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: -3, filter: `blur(${blur.soft}px)`, transition: { duration: duration.quick, ease: easeStandard } };
const fadeIn: Target = { opacity: 0 };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: duration.instant } };

const tray = {
  base: [
    "group/fbg relative isolate inline-flex flex-none flex-nowrap items-center gap-[var(--fbg-gap)] p-[var(--fbg-pad)]",
    "rounded-[var(--fbg-outer)] text-muted-foreground tracking-[-0.01em] [-webkit-tap-highlight-color:transparent]",
    "[--fbg-h:36px] [--fbg-pad:4px] [--fbg-gap:4px] [--fbg-pad-x:12px] [--fbg-outer:var(--radius-lg)]",
    "[--fbg-radius:calc(var(--fbg-outer)-var(--fbg-pad)-1px)]",
    "[--fbg-highlight:color-mix(in_oklab,var(--color-foreground)_7%,transparent)]",
    "[--fbg-highlight-press:color-mix(in_oklab,var(--color-foreground)_12%,transparent)]",
    "[--fbg-on:color-mix(in_oklab,var(--color-foreground)_12%,transparent)]",
    "[--fbg-rule:color-mix(in_oklab,var(--color-foreground)_12%,transparent)]",
    "[--fbg-tray:color-mix(in_oklab,var(--color-foreground)_4.5%,transparent)]",
    "[--fbg-tray-edge:color-mix(in_oklab,var(--color-foreground)_3%,transparent)]",
    "dark:[--fbg-highlight:color-mix(in_oklab,var(--color-foreground)_9%,transparent)]",
    "dark:[--fbg-highlight-press:color-mix(in_oklab,var(--color-foreground)_15%,transparent)]",
    "dark:[--fbg-on:color-mix(in_oklab,var(--color-foreground)_16%,transparent)]",
    "dark:[--fbg-tray:color-mix(in_oklab,var(--color-foreground)_6%,transparent)]",
    "dark:[--fbg-tray-edge:color-mix(in_oklab,var(--color-foreground)_5%,transparent)]",
    "border",
  ].join(" "),
  // The muted tray is a translucent tint, not a fill, so it still reads when it sits on a muted surface.
  muted: "border-[color:var(--fbg-tray-edge)] bg-[var(--fbg-tray)]",
  // Raised for overlays such as a selection toolbar: the floating layer shadow and a hairline edge.
  floating: "border-border bg-surface shadow-floating",
  sm: "[--fbg-h:30px] [--fbg-pad:3px] [--fbg-gap:3px] [--fbg-pad-x:10px] [--fbg-outer:calc(var(--radius-lg)-3px)] text-xs",
  md: "text-sm",
  vertical: "flex-col items-stretch",
} as const;

const itemClass = [
  "inline-flex min-w-[var(--fbg-h)] h-[var(--fbg-h)] flex-none items-center justify-center m-0 px-[var(--fbg-pad-x)] border-0",
  "rounded-[var(--fbg-radius)] bg-transparent text-inherit font-[inherit] text-[length:inherit] font-medium leading-none whitespace-nowrap",
  "cursor-pointer select-none touch-manipulation [-webkit-tap-highlight-color:transparent]",
  "transition-[color,background-color,opacity] duration-[var(--duration-quick)] ease-[var(--ease-out-quint)] motion-reduce:duration-[var(--duration-instant)]",
  "data-[icon]:not-data-[icon-only]:pl-[calc(var(--fbg-pad-x)-2px)] data-[icon-only]:w-[var(--fbg-h)] data-[icon-only]:px-0",
  "data-[active]:text-foreground aria-pressed:text-foreground aria-pressed:bg-[var(--fbg-on)]",
  "aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:text-muted-foreground/70",
  "group-data-[orientation=vertical]/fbg:not-data-[icon-only]:justify-start group-data-[orientation=vertical]/fbg:data-[icon-only]:self-center",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
].join(" ");

function Phase({ children, reduced }: { children: React.ReactNode; reduced: boolean }) {
  const present = useIsPresent();
  return (
    <motion.span
      className="inline-flex items-center gap-1.5 whitespace-nowrap"
      aria-hidden={present ? undefined : true}
      initial={reduced ? fadeIn : textIn}
      animate={rest}
      exit={reduced ? fadeOut : textOut}
      transition={{ duration: reduced ? duration.instant : duration.standard, ease: easeEnter }}
    >
      {children}
    </motion.span>
  );
}

/**
 * Icon and label. Every label the item can show is laid out invisibly in the same grid cell, so the button always has the width
 * of the widest one: a label change crossfades in place and never resizes the button, its neighbours or the tray.
 */
function ItemBody({ label, icon, iconOnly, reserve, reduced }: { label: string; icon?: React.ReactNode; iconOnly: boolean; reserve: readonly string[]; reduced: boolean }) {
  const ghosts = iconOnly ? [] : Array.from(new Set([label, ...reserve]));
  return (
    <span className="relative z-2 inline-grid items-center justify-items-center [&>*]:[grid-area:1/1] group-data-[orientation=vertical]/fbg:justify-items-start">
      {ghosts.map((text) => (
        <span key={text} className="invisible pointer-events-none inline-flex items-center gap-1.5 whitespace-nowrap" aria-hidden="true">
          {icon ? <span className="block size-4 flex-none" /> : null}
          <span className="block">{text}</span>
        </span>
      ))}
      <AnimatePresence initial={false}>
        <Phase key={label} reduced={reduced}>
          {icon ? <span className="inline-flex flex-none [&_svg]:size-4 [&_svg]:stroke-[1.75]" aria-hidden="true">{icon}</span> : null}
          {iconOnly ? null : <span className="block">{label}</span>}
        </Phase>
      </AnimatePresence>
    </span>
  );
}

function TipContent({ label, shortcut }: { label: string; shortcut?: string }) {
  return (
    <span className="inline-flex items-baseline gap-3 whitespace-nowrap">
      {label}
      {shortcut ? <kbd className="font-[inherit] tabular-nums text-[color-mix(in_oklab,var(--color-background)_58%,var(--color-foreground))]">{shortcut}</kbd> : null}
    </span>
  );
}

/**
 * Separate soft buttons in a quiet tray. One shared highlight morphs, in position and size, to whichever button the pointer
 * or keyboard focus is on, fades when the pointer leaves the tray, and settles darker in place while a button is pressed.
 * It is the toolbar's only hover and focus indicator. Arrow keys move focus, Home and End jump to the ends, Enter and Space act.
 */
export function FloatingButtonGroup({ items, label, variant = "muted", size = "md", orientation = "horizontal", iconOnly: groupIconOnly = false, tooltipSide, onAction, className, style }: FloatingButtonGroupProps) {
  const reduced = useReducedMotion() ?? false;
  const trayRef = React.useRef<HTMLDivElement>(null);
  const nodes = React.useRef(new Map<string, HTMLButtonElement>());
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [focusId, setFocusId] = React.useState<string | null>(null);
  const [pressing, setPressing] = React.useState(false);
  const [tabStop, setTabStop] = React.useState<string | null>(null);

  const actions = items.filter(isAction);
  const byId = new Map(actions.map((action) => [action.id, action]));
  const enabled = (id: string | null) => !!id && !!byId.get(id) && !byId.get(id)?.disabled;
  // Pointer wins over keyboard focus while it is in the tray; a disabled item under the pointer hands back to focus.
  const activeId = enabled(hoverId) ? hoverId : focusId && byId.has(focusId) ? focusId : null;
  const stop = enabled(tabStop) ? tabStop : actions.find((action) => !action.disabled)?.id ?? null;
  const vertical = orientation === "vertical";
  const side = tooltipSide ?? (vertical ? "right" : "top");
  const idsKey = actions.map((action) => action.id).join("\u0000");

  // The highlight lives in motion values so moving it never re-renders the buttons.
  const x = useMotionValue(0), y = useMotionValue(0), width = useMotionValue(0), height = useMotionValue(0);
  const opacity = useMotionValue(0), scale = useMotionValue(1);
  const traveling = React.useRef(false);
  const activeRef = React.useRef(activeId);
  const pressingRef = React.useRef(pressing);

  /** The button's box in tray coordinates, exact to the device pixel (offsetLeft rounds to whole pixels) and free of ancestor transforms. */
  const measure = React.useCallback((node: HTMLElement) => {
    const root = trayRef.current;
    if (!root) return null;
    const outer = root.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    const unscale = outer.width ? root.offsetWidth / outer.width : 1;
    const dpr = window.devicePixelRatio || 1;
    const snap = (value: number) => Math.round(value * unscale * dpr) / dpr;
    return { x: snap(box.left - outer.left) - root.clientLeft, y: snap(box.top - outer.top) - root.clientTop, width: snap(box.width), height: snap(box.height) };
  }, []);

  const place = React.useCallback((id: string | null, mode: "move" | "follow") => {
    const node = id ? nodes.current.get(id) : undefined;
    if (!node) {
      animate(opacity, 0, { duration: reduced ? duration.instant : duration.standard, ease: easeStandard });
      return;
    }
    const rect = measure(node);
    if (!rect) return;
    const visible = opacity.get() > 0.15;
    // Travel between buttons on the morph spring. Appearing from nothing, and every move with reduced motion, lands in place.
    const travel = !reduced && visible && (mode === "move" || traveling.current);
    if (travel) {
      traveling.current = true;
      animate(x, rect.x, spring.morph);
      animate(y, rect.y, spring.morph);
      animate(width, rect.width, spring.morph);
      animate(height, rect.height, { ...spring.morph, onComplete: () => { traveling.current = false; } });
    } else {
      traveling.current = false;
      x.jump(rect.x); y.jump(rect.y); width.jump(rect.width); height.jump(rect.height);
      if (!visible && !reduced) {
        scale.jump(0.94);
        animate(scale, pressingRef.current ? 0.965 : 1, spring.snappy);
      }
    }
    if (opacity.get() !== 1) animate(opacity, 1, { duration: reduced ? duration.instant : duration.quick, ease: easeStandard });
  }, [height, measure, opacity, reduced, scale, width, x, y]);

  React.useLayoutEffect(() => {
    activeRef.current = activeId;
    place(activeId, "move");
  }, [activeId, place]);

  React.useEffect(() => {
    pressingRef.current = pressing;
    animate(scale, pressing && activeId ? 0.965 : 1, reduced ? { duration: 0 } : spring.snappy);
  }, [activeId, pressing, reduced, scale]);

  // A font that loads or a container that reflows moves the buttons; the highlight follows without travel.
  React.useEffect(() => {
    const root = trayRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => { if (activeRef.current) place(activeRef.current, "follow"); });
    observer.observe(root);
    nodes.current.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [idsKey, place]);

  // A native listener, because React bubbles pointer events through portals: moving from a button onto its tooltip
  // would not count as leaving the tray, and the highlight would stay behind.
  React.useEffect(() => {
    const root = trayRef.current;
    if (!root) return;
    const leave = () => { setHoverId(null); setPressing(false); };
    root.addEventListener("pointerleave", leave);
    return () => root.removeEventListener("pointerleave", leave);
  }, []);

  const buttons = () => Array.from(trayRef.current?.querySelectorAll<HTMLButtonElement>("[data-fbg-item]") ?? []);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const all = buttons();
    const index = all.findIndex((node) => node === document.activeElement);
    if (index < 0) return;
    const next = vertical ? "ArrowDown" : "ArrowRight";
    const previous = vertical ? "ArrowUp" : "ArrowLeft";
    const usable = (node: HTMLButtonElement) => node.getAttribute("aria-disabled") !== "true";
    let target: HTMLButtonElement | undefined;
    if (event.key === "Home") target = all.find(usable);
    else if (event.key === "End") target = [...all].reverse().find(usable);
    else if (event.key === next || event.key === previous) {
      const step = event.key === next ? 1 : -1;
      for (let offset = 1; offset <= all.length; offset += 1) {
        const candidate = all[(index + step * offset + all.length * offset) % all.length];
        if (usable(candidate)) { target = candidate; break; }
      }
    } else return;
    event.preventDefault();
    if (!target) return;
    // The keyboard takes the highlight back until the pointer moves again.
    setHoverId(null);
    target.focus();
  };

  const onBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (trayRef.current?.contains(event.relatedTarget as Node | null)) return;
    setFocusId(null);
    setPressing(false);
  };

  return (
    <div
      ref={trayRef}
      className={cn(tray.base, tray[variant], tray[size], vertical && tray.vertical, className)}
      style={style}
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      data-variant={variant}
      data-size={size}
      data-orientation={orientation}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    >
      {/* The highlight paints above the buttons' own backgrounds (a pressed tint) and below their content. */}
      <motion.span
        className="pointer-events-none absolute top-0 left-0 z-1 rounded-[var(--fbg-radius)] bg-[var(--fbg-highlight)] transition-colors duration-[var(--duration-quick)] data-[pressing]:bg-[var(--fbg-highlight-press)] data-[pressing]:duration-[var(--duration-instant)]"
        data-pressing={pressing && activeId ? "" : undefined}
        style={{ x, y, width, height, opacity, scale }}
        aria-hidden="true"
      />
      {items.map((item, position) => {
        if (!isAction(item)) {
          return (
            <span
              key={item.id ?? `separator-${position}`}
              className={cn("flex-none self-center rounded-[1px] bg-[var(--fbg-rule)]", vertical ? "my-0.5 h-px w-[calc(var(--fbg-h)*.5)]" : "mx-0.5 h-[calc(var(--fbg-h)*.5)] w-px")}
              role="separator"
              aria-orientation={vertical ? "horizontal" : "vertical"}
            />
          );
        }
        const { id, label: itemLabel, icon, onSelect, disabled = false, pressed, shortcut, reserveLabels = [] } = item;
        const iconOnly = !!icon && (item.iconOnly ?? groupIconOnly);
        const button = (
          <button
            ref={(node) => { if (node) nodes.current.set(id, node); else nodes.current.delete(id); }}
            type="button"
            className={itemClass}
            data-fbg-item=""
            data-active={activeId === id ? "" : undefined}
            data-icon={icon ? "" : undefined}
            data-icon-only={iconOnly ? "" : undefined}
            aria-label={itemLabel}
            aria-pressed={pressed === undefined ? undefined : pressed}
            aria-disabled={disabled || undefined}
            tabIndex={stop === id ? 0 : -1}
            onPointerMove={(event) => { if (event.pointerType === "mouse" || event.pointerType === "pen") setHoverId(id); }}
            onPointerDown={(event) => { if (disabled || event.button !== 0) return; setHoverId(id); setPressing(true); }}
            onPointerUp={() => setPressing(false)}
            onPointerCancel={() => setPressing(false)}
            onPointerLeave={() => setPressing(false)}
            onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && !event.repeat && !disabled) setPressing(true); }}
            onKeyUp={(event) => { if (event.key === "Enter" || event.key === " ") setPressing(false); }}
            onFocus={(event) => {
              setTabStop(id);
              let keyboard = false;
              try { keyboard = event.currentTarget.matches(":focus-visible"); } catch { keyboard = false; }
              setFocusId(keyboard ? id : null);
            }}
            onClick={() => {
              if (disabled) return;
              onSelect?.();
              onAction?.(id);
            }}
          >
            <ItemBody label={itemLabel} icon={icon} iconOnly={iconOnly} reserve={reserveLabels} reduced={reduced} />
          </button>
        );
        // Tooltips render no wrapper element, so every button stays a direct child of the tray and measures against it.
        if (!iconOnly && !shortcut) return <React.Fragment key={id}>{button}</React.Fragment>;
        return (
          <Tooltip key={id} side={side} content={<TipContent label={itemLabel} shortcut={shortcut} />}>
            {button}
          </Tooltip>
        );
      })}
    </div>
  );
}
