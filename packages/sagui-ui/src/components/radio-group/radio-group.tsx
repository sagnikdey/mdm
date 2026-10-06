import * as React from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";

export interface RadioGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Names the group, shown as its legend. */
  label: string;
  options: RadioGroupOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Form field name. Generated when omitted. */
  name?: string;
  disabled?: boolean;
  className?: string;
}

/** Sizes the highlight to the chosen row. A new choice glides on the morph spring; the first paint and resizes place it at once. */
function place(highlight: HTMLElement | null, row: HTMLElement | null | undefined, at: { current: string }, glide: boolean) {
  const next = row ? `${row.offsetTop} ${row.offsetHeight}` : "";
  if (!highlight || next === at.current) return;
  const visible = at.current !== "";
  at.current = next;
  if (!row) { animate(highlight, { opacity: 0 }, { duration: 0 }); return; }
  const target = { y: row.offsetTop, height: row.offsetHeight, opacity: 1 };
  if (glide && visible) { animate(highlight, target, { ...spring.morph, opacity: { duration: 0 } }); return; }
  // Written to the element too, so the paint that drops the server fallback already shows the highlight in place.
  Object.assign(highlight.style, { transform: `translateY(${target.y}px)`, height: `${target.height}px`, opacity: "1" });
  animate(highlight, target, { duration: 0 });
}

/**
 * One highlight travels to the chosen row while the new dot springs in and the old one shrinks away, so a change reads as a
 * single physical move. Arrow keys take the same path. Rows and text never resize.
 */
export function RadioGroup({ label, options, value: valueProp, defaultValue, onValueChange, name, disabled = false, className }: RadioGroupProps) {
  const id = React.useId();
  const reduced = useReducedMotion();
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const value = valueProp ?? internal;
  const listRef = React.useRef<HTMLDivElement>(null);
  const highlightRef = React.useRef<HTMLSpanElement>(null);
  const rows = React.useRef<(HTMLLabelElement | null)[]>([]);
  const shown = React.useRef<number | null>(null);
  const at = React.useRef("");
  const selected = options.findIndex((option) => option.value === value);
  React.useLayoutEffect(() => {
    place(highlightRef.current, rows.current[selected], at, shown.current !== null && shown.current !== selected && !reduced);
    shown.current = selected;
    listRef.current?.setAttribute("data-ready", "");
  }, [selected, reduced]);
  React.useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => place(highlightRef.current, rows.current[shown.current ?? -1], at, false));
    observer.observe(list);
    rows.current.forEach((row) => row && observer.observe(row));
    return () => observer.disconnect();
  }, [options.length]);
  const change = (next: string) => {
    if (valueProp === undefined) setInternal(next);
    onValueChange?.(next);
  };
  return (
    <fieldset className={cn("m-0 grid min-w-0 border-0 p-0", className)} disabled={disabled}>
      <legend className="mb-2 p-0 text-sm font-medium leading-snug text-foreground">{label}</legend>
      <div ref={listRef} className="group/opts relative grid gap-2">
        {/* One highlight travels between the rows: above their borders and fills, below their text, so it never crosses a label. */}
        <span ref={highlightRef} className="pointer-events-none absolute inset-x-0 top-0 z-1 box-border rounded-[var(--radius-md)] border border-primary bg-primary/5 opacity-0" aria-hidden="true" />
        {options.map((option, index) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              ref={(node) => { rows.current[index] = node; }}
              className={cn(
                "group/opt relative flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-border p-3 [-webkit-tap-highlight-color:transparent]",
                "transition-[background-color,border-color] duration-[var(--duration-quick)] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
                "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted active:bg-muted",
                // Until the highlight is placed (server paint or no script), the checked row carries the same look itself.
                "group-not-data-[ready]/opts:has-[input:checked]:border-primary group-not-data-[ready]/opts:has-[input:checked]:bg-primary/5",
                "has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring has-[input:focus-visible]:ring-offset-2 has-[input:focus-visible]:ring-offset-background",
                "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50"
              )}
            >
              <input className="absolute opacity-0" type="radio" name={name ?? id} value={option.value} checked={checked} disabled={option.disabled} onChange={() => change(option.value)} />
              {/* Rows are not stacking contexts, so their mark and copy rise above the highlight while their border and fill stay below it. */}
              <span
                className={cn(
                  "relative z-2 grid size-[17px] flex-none place-items-center rounded-full border border-border-strong",
                  "[transition:border-color_var(--duration-quick)_var(--ease-out-quint),background-color_var(--duration-quick)_var(--ease-out-quint),transform_var(--duration-spring)_var(--ease-spring)]",
                  "group-has-[input:checked]/opt:border-primary group-has-[input:checked]/opt:bg-primary",
                  // A faint dot previews the choice while the pointer is down, then the real dot springs in on release.
                  "after:size-[7px] after:rounded-full after:bg-foreground after:opacity-0 after:transition-opacity after:duration-[var(--duration-instant)] after:content-[''] after:[grid-area:1/1]",
                  "group-active/opt:group-not-has-[input:checked]/opt:after:opacity-20",
                  "group-active/opt:scale-[.88] group-active/opt:[transition-duration:var(--duration-quick),var(--duration-quick),100ms]",
                  "motion-reduce:transition-none motion-reduce:group-active/opt:scale-100"
                )}
                aria-hidden="true"
              >
                <motion.span
                  className="size-[7px] rounded-full bg-foreground [grid-area:1/1] group-has-[input:checked]/opt:bg-primary-foreground"
                  initial={false}
                  animate={checked ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
                  transition={reduced ? { duration: 0 } : ({ ...spring.snappy, opacity: { duration: checked ? duration.fast : duration.instant } } as never)}
                />
              </span>
              <span className="relative z-2 min-w-0">
                <span className={cn("block text-sm font-medium text-muted-foreground transition-colors duration-[var(--duration-standard)] group-has-[input:checked]/opt:text-foreground motion-reduce:transition-none")}>{option.label}</span>
                {option.description && <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
