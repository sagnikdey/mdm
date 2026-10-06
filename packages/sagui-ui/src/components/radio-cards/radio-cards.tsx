import * as React from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeStandard, physical } from "../../lib/motion";
import { useReducedFlag } from "../../lib/use-reduced";

export interface RadioCardOption {
  value: string;
  label: React.ReactNode;
  /** One or two short lines under the label. */
  description?: React.ReactNode;
  /** A price, estimate, or other value. Sits at the end of a list row, or under the text in a grid card. */
  meta?: React.ReactNode;
  /** Plain decorative icon beside the label. */
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Short reason shown in place of the description when the option is disabled. */
  disabledReason?: React.ReactNode;
}

/**
 * Selectable option cards for choices that need more than a label: plans, shipping speeds, regions. One selection ring
 * glides from card to card on a spring, so the eye follows the change. Behaves as a native radio group: one tab stop,
 * arrow keys move and select, and a hidden input carries the value in forms.
 */
export interface RadioCardsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: RadioCardOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** "grid" places cards in responsive columns; "list" stacks full width rows. */
  layout?: "grid" | "list";
  /** Narrowest a grid column may get before the grid drops a column, in px. */
  minColumnWidth?: number;
  /** Form field name. Renders a hidden input with the selected value. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

const GLIDE = physical(0.42, 0.14);

export const RadioCards = React.forwardRef<HTMLDivElement, RadioCardsProps>(function RadioCards({
  options, value, defaultValue = null, onValueChange, layout = "grid", minColumnWidth = 180, name, required, disabled = false, className, style, ...rest
}, forwardedRef) {
  const reduced = useReducedFlag();
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);
  const [internal, setInternal] = React.useState<string | null>(defaultValue);
  const selected = value !== undefined ? value : internal;
  const selectedIndex = options.findIndex((option) => option.value === selected);
  const usable = (option: RadioCardOption) => !disabled && !option.disabled;
  const tabStop = selectedIndex >= 0 && usable(options[selectedIndex]) ? selectedIndex : options.findIndex(usable);
  const grid = layout === "grid";

  const select = (next: string) => {
    if (next === selected) return;
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  /* The ring: one element that springs to the selected card's box. At rest it follows layout changes exactly. */
  const x = useMotionValue(0), y = useMotionValue(0), w = useMotionValue(0), h = useMotionValue(0), o = useMotionValue(0);
  const placed = React.useRef(false);
  const place = React.useCallback((glide: boolean) => {
    const node = selectedIndex < 0 ? null : rootRef.current?.querySelector<HTMLElement>(`[data-card="${selectedIndex}"]`);
    if (!node) { o.set(0); placed.current = false; return; }
    const box = [node.offsetLeft, node.offsetTop, node.offsetWidth, node.offsetHeight];
    if (!glide || !placed.current || reduced) {
      x.jump(box[0]); y.jump(box[1]); w.jump(box[2]); h.jump(box[3]);
      if (!placed.current && !reduced && glide) { o.jump(0); animate(o, 1, { duration: duration.fast, ease: easeStandard }); }
      else o.jump(1);
      placed.current = true;
      return;
    }
    animate(x, box[0], GLIDE); animate(y, box[1], GLIDE); animate(w, box[2], GLIDE); animate(h, box[3], GLIDE);
    o.set(1);
  }, [h, o, reduced, selectedIndex, w, x, y]);

  const placeRef = React.useRef(place);
  React.useLayoutEffect(() => { placeRef.current = place; place(true); }, [place]);
  // A resize only snaps the ring to the new layout; it never replays the glide.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => placeRef.current(false));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const cards = () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-card]") ?? []);
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (usable(options[index])) select(options[index].value);
      return;
    }
    if (!step && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const count = options.length;
    const rtl = step && (event.key === "ArrowLeft" || event.key === "ArrowRight") && getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
    let at = event.key === "Home" ? -1 : event.key === "End" ? count : index;
    const dir = event.key === "Home" ? 1 : event.key === "End" ? -1 : step * rtl;
    for (let tries = 0; tries < count; tries++) {
      at = (at + dir + count) % count;
      if (usable(options[at])) { cards()[at]?.focus(); select(options[at].value); return; }
    }
  };

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      aria-disabled={disabled || undefined}
      aria-required={required || undefined}
      className={cn(
        "relative grid text-sm leading-snug tracking-[-0.01em] text-foreground [&_*]:box-border",
        grid ? "gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,var(--min-column,180px)),1fr))]" : "gap-2 grid-cols-[minmax(0,1fr)]",
        className
      )}
      data-layout={layout}
      style={{ "--min-column": `${minColumnWidth}px`, ...style } as React.CSSProperties}
      {...rest}
    >
      {/* The one moving part: a ring that springs from card to card. It sits over the card border so the card itself never changes size. */}
      <motion.span className="pointer-events-none absolute top-0 left-0 z-1 rounded-[var(--radius-xl)] border-[1.5px] border-primary" style={{ x, y, width: w, height: h, opacity: o }} aria-hidden="true" />
      {options.map((option, index) => {
        const checked = index === selectedIndex;
        const off = !usable(option);
        const labelId = `${uid}-${index}-label`;
        const descriptionId = `${uid}-${index}-description`;
        const description = off && option.disabledReason ? option.disabledReason : option.description;
        return (
          <div
            key={option.value}
            role="radio"
            data-card={index}
            className={cn(
              "group/card relative grid min-w-0 cursor-pointer select-none items-start gap-x-3 gap-y-1 rounded-[var(--radius-xl)] border border-border bg-surface [-webkit-tap-highlight-color:transparent]",
              "transition-[background-color,border-color] duration-[var(--duration-quick)] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
              grid
                ? "px-4 py-3.5 [grid-template-areas:'body_indicator'_'meta_meta'] grid-cols-[minmax(0,1fr)_auto] grid-rows-[minmax(0,1fr)_auto]"
                : "items-center py-[13px] pr-4 pl-3.5 [grid-template-areas:'indicator_body_meta'] grid-cols-[auto_minmax(0,1fr)_auto]",
              checked && "bg-[color-mix(in_oklab,var(--color-primary)_4%,var(--color-surface))]",
              off && "cursor-not-allowed bg-muted",
              !checked && !off && "[@media(hover:hover)_and_(pointer:fine)]:hover:border-border-strong active:bg-muted focus-visible:border-border-strong focus-visible:bg-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
            aria-checked={checked}
            aria-disabled={off || undefined}
            aria-labelledby={labelId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={index === tabStop ? 0 : -1}
            data-checked={checked || undefined}
            onClick={() => { if (!off) select(option.value); }}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            <span
              className={cn(
                "grid size-[18px] flex-none place-items-center rounded-full border-[1.5px] border-border-strong [grid-area:indicator] transition-[border-color,background-color] duration-[var(--duration-quick)] motion-reduce:transition-none",
                grid && "mt-px",
                checked && "border-primary bg-primary",
                off && "border-border"
              )}
              aria-hidden="true"
            >
              <motion.span className="size-1.5 rounded-full bg-primary-foreground" initial={false} animate={{ scale: checked ? 1 : 0 }} transition={reduced ? { duration: 0 } : spring.snappy} />
            </span>
            <span className="grid min-w-0 gap-0.5 [grid-area:body]">
              <span id={labelId} className={cn("flex min-w-0 items-center gap-2 font-medium", off && "text-muted-foreground")}>
                {option.icon && <span className={cn("grid size-[18px] flex-none place-items-center text-muted-foreground [&>svg]:size-[18px]", checked && "text-foreground")}>{option.icon}</span>}
                <span className="min-w-0 truncate">{option.label}</span>
              </span>
              {description && <span id={descriptionId} className="text-xs leading-snug text-muted-foreground [text-wrap:pretty]">{description}</span>}
            </span>
            {option.meta && <span className={cn("tabular-nums whitespace-nowrap [grid-area:meta]", grid ? "mt-2.5 text-lg" : "font-medium", off ? "text-muted-foreground" : "text-foreground")}>{option.meta}</span>}
          </div>
        );
      })}
      {name && <input type="hidden" name={name} value={selected ?? ""} required={required} />}
    </div>
  );
});
RadioCards.displayName = "RadioCards";
