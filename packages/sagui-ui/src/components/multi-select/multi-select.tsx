import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { ChevronDown, X } from "lucide-react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { FieldMessage, adornmentButton, describedBy, fieldLabel } from "../../lib/field";
import { easeEnter, easeStandard } from "../../lib/motion";

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  /** Visible label and accessible name. */
  label: string;
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  description?: string;
  /** Error copy. Colors the border and is announced as an alert. */
  error?: string;
  /** Chips shown before the rest collapse into a "+n" count. */
  maxVisible?: number;
  disabled?: boolean;
  className?: string;
}

/** Each chip sits in a slot whose width opens and collapses on a spring, so neighbours travel with it and nothing overlaps. */
const slot: Variants = {
  hidden: { width: 0, opacity: 0 },
  shown: { width: "auto", opacity: 1, transition: { width: spring.smooth, opacity: { duration: duration.fast, ease: easeEnter } } as never },
  gone: { width: 0, opacity: 0, transition: { width: spring.smooth, opacity: { duration: duration.instant, ease: easeStandard } } as never },
};
/** The chip itself grows in from .9 with a soft blur and shrinks back as it leaves. */
const chip: Variants = {
  hidden: { scale: 0.9, filter: `blur(${blur.soft}px)` },
  shown: { scale: 1, filter: "blur(0px)", transition: { ...spring.snappy, filter: { duration: duration.standard, ease: easeEnter } } as never },
  gone: { scale: 0.9, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.instant, ease: easeStandard } },
};
/** Reduced motion keeps short crossfades; resting states match the moving variants so server and client markup agree. */
const fade: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.instant } }, gone: { opacity: 0, transition: { duration: duration.instant } } };
const slotFade: Variants = { hidden: { opacity: 0 }, shown: { width: "auto", opacity: 1, transition: { duration: duration.instant } }, gone: { opacity: 0, transition: { duration: duration.instant } } };
const chipStill: Variants = { hidden: { scale: 1, filter: "blur(0px)" }, shown: { scale: 1, filter: "blur(0px)" }, gone: { scale: 1, filter: "blur(0px)" } };
/** The overflow count rolls: a larger number rises from below, a smaller one drops from above. */
const roll: Variants = {
  hidden: (direction: number) => ({ opacity: 0, y: `${direction * 0.5}em`, filter: `blur(${blur.subtle}px)` }),
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.standard, ease: easeEnter } },
  gone: (direction: number) => ({ opacity: 0, y: `${direction * -0.5}em`, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.instant, ease: easeStandard } }),
};

/** A check that draws itself when an option is picked and retracts when it is removed. */
function CheckMark({ reduce }: { reduce: boolean | null }) {
  return (
    <svg className="flex-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <motion.path
        d="M4 12.5 9 17.5 20 6.5"
        initial={reduce ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={reduce ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
        transition={reduce ? { duration: duration.instant } : { pathLength: { duration: duration.standard, ease: easeEnter }, opacity: { duration: duration.instant } }}
      />
    </svg>
  );
}

const chipClass = "box-border mr-[5px] max-w-36 flex-none truncate rounded-full bg-muted px-2 py-1 text-xs text-foreground shadow-[inset_0_0_0_1px_var(--color-border)] transition-colors duration-[var(--duration-quick)] motion-reduce:transition-none group-aria-expanded/trigger:bg-surface [@media(hover:hover)_and_(pointer:fine)]:group-hover/trigger:group-enabled/trigger:bg-surface";

/** Select several values while keeping the field readable: chips open and close on springs, and extras collapse into a rolling "+n". */
export function MultiSelect({ label, options, value, defaultValue = [], onValueChange, placeholder = "Select options", description, error, maxVisible = 2, disabled = false, className }: MultiSelectProps) {
  const id = React.useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const hintId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [internal, setInternal] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const selected = value ?? internal;
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);
  const labelFor = (item: string) => options.find((option) => option.value === item)?.label ?? item;
  const visible = selected.slice(0, maxVisible).map((item) => ({ value: item, label: labelFor(item) }));
  const remaining = Math.max(0, selected.length - visible.length);
  // A closed menu forgets its highlight, so the next open starts clean instead of on a stale hovered row.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (wasOpen !== open) { setWasOpen(open); if (!open) setActiveIndex(-1); }
  const [previousRemaining, setPreviousRemaining] = React.useState(remaining);
  const [countDirection, setCountDirection] = React.useState(1);
  if (previousRemaining !== remaining) { setPreviousRemaining(remaining); setCountDirection(remaining > previousRemaining ? 1 : -1); }

  React.useEffect(() => {
    const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const update = (next: string[]) => { if (value === undefined) setInternal(next); onValueChange?.(next); };
  const toggle = (option: MultiSelectOption) => {
    if (disabled || option.disabled) return;
    update(selectedSet.has(option.value) ? selected.filter((item) => item !== option.value) : [...selected, option.value]);
  };
  const clear = () => { update([]); setOpen(false); };
  const enabled = options.map((option, index) => (option.disabled ? -1 : index)).filter((index) => index >= 0);
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "Enter" && open && activeIndex >= 0) { event.preventDefault(); toggle(options[activeIndex]); return; }
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen((current) => !current); return; }
    if (event.key === "Escape") { setOpen(false); return; }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && enabled.length) {
      event.preventDefault();
      setOpen(true);
      const current = enabled.indexOf(activeIndex);
      const next = current < 0 ? (event.key === "ArrowDown" ? 0 : enabled.length - 1) : event.key === "ArrowDown" ? (current + 1) % enabled.length : (current - 1 + enabled.length) % enabled.length;
      setActiveIndex(enabled[next]);
    }
  };
  const reduce = useReducedMotion();

  return (
    <div ref={rootRef} className={cn("relative grid min-w-0", className)}>
      <span id={labelId} className={fieldLabel}>{label}</span>
      <div className="relative min-w-0">
        {/* The trigger anchors the menu, so press feedback stays in color; it never scales. */}
        <button
          type="button"
          className={cn(
            "group/trigger relative flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border bg-surface py-[5px] pr-[11px] pl-3 text-left text-sm text-foreground ",
            "transition-[border-color,background-color,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
            "[@media(hover:hover)_and_(pointer:fine)]:hover:enabled:border-border-strong [@media(hover:hover)_and_(pointer:fine)]:hover:enabled:bg-muted",
            "active:enabled:border-border-strong active:enabled:bg-muted aria-expanded:border-border-strong aria-expanded:bg-muted",
            "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-destructive focus-visible:ring-destructive/25" : "border-border"
          )}
          disabled={disabled}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-describedby={describedBy(hintId, errorId)}
          aria-invalid={error ? true : undefined}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={onKeyDown}
        >
          <span id={valueId} className="sr-only">{selected.length ? selected.map(labelFor).join(", ") : placeholder}</span>
          <span className="relative flex min-h-[26px] min-w-0 flex-1 items-center overflow-hidden" aria-hidden="true">
            <AnimatePresence initial={false}>
              {visible.map((item) => (
                <motion.span key={`chip-${item.value}`} className="flex min-w-0 flex-[0_1_auto] overflow-hidden" variants={reduce ? slotFade : slot} initial="hidden" animate="shown" exit="gone">
                  <motion.span className={chipClass} variants={reduce ? chipStill : chip}>{item.label}</motion.span>
                </motion.span>
              ))}
              {remaining > 0 && (
                <motion.span key="more" className="flex min-w-0 flex-shrink-0 overflow-hidden" variants={reduce ? slotFade : slot} initial="hidden" animate="shown" exit="gone">
                  <motion.span className={cn(chipClass, "inline-flex tabular-nums text-muted-foreground")} variants={reduce ? chipStill : chip}>
                    +
                    <span className="inline-grid">
                      <AnimatePresence initial={false} custom={countDirection}>
                        <motion.span key={remaining} className="[grid-area:1/1]" custom={countDirection} variants={reduce ? fade : roll} initial="hidden" animate="shown" exit="gone">{remaining}</motion.span>
                      </AnimatePresence>
                    </span>
                  </motion.span>
                </motion.span>
              )}
              {/* The placeholder sits outside the flow so the first chip can open its slot from the leading edge. */}
              {!selected.length && (
                <motion.span key="placeholder" className="absolute inset-0 flex items-center overflow-hidden whitespace-nowrap text-muted-foreground" variants={fade} initial="hidden" animate="shown" exit="gone">{placeholder}</motion.span>
              )}
            </AnimatePresence>
          </span>
          {/* The chevron stays pinned to the trailing edge; a selection only reserves room for the clear button beside it, so nothing jumps. */}
          <ChevronDown className={cn("flex-none text-muted-foreground [transition:transform_var(--duration-spring)_var(--ease-spring)] group-aria-expanded/trigger:rotate-180 motion-reduce:transition-none", selected.length > 0 && "ml-[26px]")} size={16} aria-hidden="true" />
        </button>
        <AnimatePresence initial={false}>
          {selected.length > 0 && !disabled && (
            <motion.button
              type="button"
              aria-label="Clear selections"
              className={cn(adornmentButton, "absolute inset-y-0 right-9 my-auto size-[22px] rounded-full active:scale-100")}
              onClick={clear}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: `blur(${blur.subtle}px)` }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: reduce ? { duration: duration.instant } : ({ ...spring.snappy, opacity: { duration: duration.fast } } as never) }}
              exit={{ opacity: 0, ...(reduce ? {} : { scale: 0.6, filter: `blur(${blur.subtle}px)` }), transition: { duration: duration.instant, ease: easeStandard } }}
              whileTap={{ scale: reduce ? 1 : 0.96, transition: { duration: duration.instant, ease: easeStandard } }}
            >
              <X size={14} aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={`${id}-listbox`}
              className="absolute inset-x-0 top-[calc(100%+8px)] z-80 origin-top overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface p-[5px] shadow-floating will-change-[transform,opacity]"
              role="listbox"
              aria-label={label}
              aria-multiselectable="true"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? { duration: duration.instant } : ({ ...spring.snappy, opacity: { duration: duration.fast, ease: easeEnter } } as never) }}
              exit={{ opacity: 0, ...(reduce ? {} : { y: -4, scale: 0.98 }), transition: { duration: duration.instant, ease: easeStandard } }}
            >
              {options.map((option, index) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedSet.has(option.value)}
                  aria-disabled={option.disabled || undefined}
                  key={option.value}
                  // Arrow keys move the highlight often, so it changes almost instantly. Selection is shown by the check, so labels never reflow.
                  className="flex min-h-[38px] w-full cursor-pointer items-center justify-between gap-3 rounded-[calc(var(--radius-xl)-5px)] border-0 bg-transparent px-[11px] text-left text-sm text-foreground transition-colors duration-75 data-[active=true]:bg-muted disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                  data-active={activeIndex === index}
                  disabled={option.disabled}
                  onPointerMove={() => { if (activeIndex !== index) setActiveIndex(index); }}
                  onClick={() => toggle(option)}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  <AnimatePresence initial={false}>{selectedSet.has(option.value) && <CheckMark key="check" reduce={reduce} />}</AnimatePresence>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FieldMessage id={hintId} text={description} rollNumbers={false} />
      <FieldMessage id={errorId} text={error} tone="error" rollNumbers={false} />
    </div>
  );
}
