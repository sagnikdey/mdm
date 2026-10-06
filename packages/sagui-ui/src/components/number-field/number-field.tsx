import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue, type Variants } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { FieldMessage, fieldLabel } from "../../lib/field";
import { easeEnter, easeStandard, physical } from "../../lib/motion";

/** Text shown beside the number. A function receives the value, so a unit can follow it: `n => n === 1 ? " seat" : " seats"`. */
export type NumberFieldAffix = string | ((value: number) => string);

export type NumberFieldSize = "sm" | "md" | "lg";

export interface NumberFieldProps {
  /** Visible label; also names the stepper buttons. */
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** PageUp, PageDown, and Shift with an arrow move this far. Defaults to ten steps. */
  largeStep?: number;
  description?: string;
  disabled?: boolean;
  id?: string;
  /** Text before the number, such as "$". */
  prefix?: NumberFieldAffix;
  /** Text after the number, such as " seats". */
  suffix?: NumberFieldAffix;
  /** Drag the label sideways to scrub the value, one step every few pixels. */
  scrub?: boolean;
  /** Formatting locale. Fixed by default so server and client render the same digits. */
  locale?: string;
  /** Fraction digits and grouping. Fraction digits follow the precision of `step` by default. */
  formatOptions?: { minimumFractionDigits?: number; maximumFractionDigits?: number; useGrouping?: boolean };
  /** Control height, type size, and default width. */
  size?: NumberFieldSize;
  /** A short note beside the label when a press meets a limit or a typed value passes one. `false` hides it; a function writes the copy. */
  limitHint?: boolean | ((edge: "min" | "max", limit: number) => string);
  className?: string;
}

type Source = "button" | "key" | "scrub" | "type";
type Part = { key: string; digit: number } | { key: string; text: string };

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
/** Pixels of label drag per step, the pause before a held control repeats, and the fastest repeat. */
const SCRUB_PX = 6, HOLD_DELAY = 400, HOLD_FASTEST = 40;
/** A held press keeps leaning on a limit at this cadence, how long the limit note stays, and how long an under-minimum draft waits
 * before it warns (a short draft is often on its way to a larger number). */
const LIMIT_PUSH = 240, LIMIT_HINT_MS = 1500, UNDER_WARN_MS = 700;
/** Pushes that arrive within this window count as one continued effort, so each strains a little further, up to the cap. */
const PUSH_WINDOW = 700, PUSH_GAIN = 0.22, PUSH_CAP = 4;
/** A velocity kick on the value at a limit: it strains a few pixels toward the press and springs home. */
const BUMP_VELOCITY = 130;
const kick = physical(spring.morph.visualDuration, spring.morph.bounce);

const sizes: Record<NumberFieldSize, string> = {
  sm: "[--nf-height:32px] [--nf-step:26px] [--nf-inset:3px] [--nf-text:.875rem] [--nf-width:var(--number-field-width,164px)]",
  md: "[--nf-height:40px] [--nf-step:32px] [--nf-inset:3px] [--nf-text:1rem] [--nf-width:var(--number-field-width,196px)]",
  lg: "[--nf-height:48px] [--nf-step:40px] [--nf-inset:4px] [--nf-text:1.125rem] [--nf-width:var(--number-field-width,228px)]",
};

const decimalsOf = (value: number) => (String(value).split(".")[1] ?? "").length;
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
const affixText = (affix: NumberFieldAffix | undefined, value: number) => (typeof affix === "function" ? affix(value) : affix ?? "");
/** iOS style resistance: travel past a limit gives less and less, and never more than `limit` pixels. */
const rubber = (distance: number, limit = 10) => Math.sign(distance) * (1 - 1 / ((Math.abs(distance) * 0.55) / limit + 1)) * limit;

/** Split a formatted number into columns keyed by place value, so 9 → 10 keeps the ones column the ones column. */
function partsOf(value: number, format: Intl.NumberFormat): Part[] {
  const parts = format.formatToParts(value);
  let place = parts.reduce((count, part) => count + (part.type === "integer" ? part.value.length : 0), 0);
  let fraction = 0;
  return parts.flatMap((part, index): Part[] => {
    if (part.type === "integer") return [...part.value].map((char) => ({ key: `i${--place}`, digit: Number(char) }));
    if (part.type === "fraction") return [...part.value].map((char) => ({ key: `f${fraction++}`, digit: Number(char) }));
    return [{ key: part.type === "group" ? `g${place}` : part.type === "decimal" ? "d" : part.type === "minusSign" ? "m" : `${part.type}${index}`, text: part.value }];
  });
}

/* A column or character opens its width while it rises in the direction of change, and closes on a critically damped spring so it never passes zero.
   Scale and opacity ride the same spring as width, so a digit grows with its slot instead of landing on its neighbours. */
const slot: Variants = {
  enter: (direction: number) => ({ width: 0, scale: 0.6, opacity: 0, y: `${direction * 0.3}em`, filter: `blur(${blur.soft}px)` }),
  center: { width: "auto", scale: 1, opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" }, transition: { width: spring.morph, scale: spring.morph, opacity: spring.morph, y: spring.snappy, filter: { duration: 0.3, ease: easeStandard } } as never },
  exit: (direction: number) => ({ width: 0, scale: 0.6, opacity: 0, y: `${direction * -0.3}em`, filter: `blur(${blur.subtle}px)`, transition: { width: spring.smooth, scale: spring.smooth, y: { duration: duration.fast, ease: easeStandard }, opacity: { duration: duration.instant }, filter: { duration: duration.instant } } as never }),
};
/* Reduced motion keeps a short fade and no travel. While typing, columns follow the draft at once so they never lag the caret.
   Every resting state matches `slot`, so a page hydrated with reduced motion renders the same styles as the server. */
const restState = (opacity: number) => ({ width: "auto", scale: 1, opacity, y: 0, filter: "none" });
const still: Variants = { enter: restState(0), center: { ...restState(1), transition: { duration: duration.instant } }, exit: { width: 0, opacity: 0, transition: { duration: 0 } } };
const cut: Variants = { enter: restState(1), center: { ...restState(1), transition: { duration: 0 } }, exit: { width: 0, opacity: 0, transition: { duration: 0 } } };

/** One digit on the wheel. Its distance from the wheel position sets where it sits, how clear it is, and whether it shows. */
function Glyph({ position, digit }: { position: MotionValue<number>; digit: number }) {
  // Every style reads the wheel directly: a chained transform can update a frame late and leave the wheel blank on a jump.
  const offset = (current: number) => ((((digit - current) % 10) + 15) % 10) - 5;
  const y = useTransform(position, (current) => `${offset(current) * 1.05}em`);
  // An eased falloff keeps a turning digit legible through the middle of the roll instead of washing out.
  const opacity = useTransform(position, (current) => Math.max(0, 1 - Math.abs(offset(current)) ** 1.5 * 1.1));
  const visibility = useTransform(position, (current) => (Math.abs(offset(current)) >= 1 ? "hidden" : "visible"));
  const filter = useTransform(position, (current) => {
    const distance = Math.abs(offset(current));
    return distance < 0.02 || distance >= 1 ? "none" : `blur(${(distance * blur.soft * 0.75).toFixed(2)}px)`;
  });
  return <motion.span className="absolute inset-x-0 inset-y-[var(--feather)] text-center" style={{ y, opacity, filter, visibility }}>{digit}</motion.span>;
}

/** An odometer wheel. It turns the way the whole number moved, wraps 9 → 0, and retargets mid spin when steps arrive quickly. */
function Wheel({ digit, direction, instant }: { digit: number; direction: number; instant: boolean }) {
  const reduced = useReducedMotion();
  const position = useMotionValue(digit);
  const wheel = React.useRef({ digit, target: digit });
  React.useLayoutEffect(() => {
    const state = wheel.current;
    if (state.digit === digit) return;
    // Turn the way the number moved, unless that is more than half a turn; then take the short way, so a big clamp never spins.
    let delta = direction > 0 ? (digit - state.digit + 10) % 10 : -((state.digit - digit + 10) % 10);
    if (Math.abs(delta) > 5) delta -= Math.sign(delta) * 10;
    state.target += delta;
    state.digit = digit;
    if (instant || reduced) position.jump(state.target);
    else animate(position, state.target, spring.snappy);
  }, [digit, direction, instant, position, reduced]);
  return (
    <>
      <span className="invisible">0</span>
      {DIGITS.map((item) => <Glyph key={item} position={position} digit={item} />)}
    </>
  );
}

// Each digit is a wheel whose window reaches a little past the line box and feathers out, so a turning digit fades at the edge instead of being cut.
// The window clips vertically only: a column opening its width shows its whole digit fading in, never a sliver.
const columnClass = "relative inline-block overflow-x-visible overflow-y-clip -my-[var(--feather)] py-[var(--feather)] [--feather:.2em] [mask-image:linear-gradient(to_bottom,transparent,#000_calc(var(--feather)*1.5),#000_calc(100%-var(--feather)*1.5),transparent)] [mask-repeat:repeat-x] [mask-clip:no-clip]";

function Digits({ value, format, direction, instant }: { value: number; format: Intl.NumberFormat; direction: number; instant: boolean }) {
  const reduced = useReducedMotion();
  const variants = instant ? cut : reduced ? still : slot;
  return (
    <AnimatePresence initial={false} custom={direction}>
      {partsOf(value, format).map((part) => (
        <motion.span key={part.key} className={"digit" in part ? columnClass : "inline-block overflow-x-clip whitespace-pre"} custom={direction} variants={variants} initial="enter" animate="center" exit="exit">
          {"digit" in part ? <Wheel digit={part.digit} direction={direction} instant={instant} /> : part.text}
        </motion.span>
      ))}
    </AnimatePresence>
  );
}

/** Prefix and suffix characters are keyed by position, so "seat" → "seats" only opens the new "s" and the rest holds still. */
function AffixText({ text, direction }: { text: string; direction: number }) {
  const reduced = useReducedMotion();
  return (
    <span className="inline-flex font-normal text-muted-foreground">
      <AnimatePresence initial={false} custom={direction}>
        {[...text].map((char, index) => (
          <motion.span key={`${index}:${char}`} className="inline-block overflow-x-clip whitespace-pre" custom={direction} variants={reduced ? still : slot} initial="enter" animate="center" exit="exit">{char}</motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

/** The limit note rises in from the side it guards (up for a maximum, down for a minimum) and fades out in place. */
function LimitNote({ id, edge, text }: { id: string; edge: 1 | -1 | 0; text: string }) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {edge !== 0 && (
        <motion.span
          key="limit"
          id={id}
          className="flex-none text-xs font-medium leading-snug tracking-[-0.01em] whitespace-nowrap tabular-nums text-[var(--nf-limit)]"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: `${edge * 0.45}em`, filter: `blur(${blur.subtle}px)` }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
          exit={{ opacity: 0, transition: { duration: reduced ? duration.instant : duration.standard, ease: easeStandard } }}
          transition={reduced ? { duration: duration.instant } : ({ y: spring.snappy, opacity: { duration: duration.fast }, filter: { duration: duration.fast } } as never)}
        >
          {text}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/** Pointer presses hold to repeat; keyboard and assistive clicks (detail 0) take one step. */
function StepButton({ toward, label, disabled, controls, limit, pressed, iconRef, onPress, onRelease, onActivate }: { toward: 1 | -1; label: string; disabled?: boolean; controls: string; limit: boolean; pressed: boolean; iconRef: React.Ref<HTMLSpanElement>; onPress: () => void; onRelease: () => void; onActivate: () => void }) {
  const Icon = toward > 0 ? Plus : Minus;
  // A limit dims the button but keeps it focusable, so a press there strains the value instead of dropping focus.
  // Mouse presses keep focus where it was: an open draft commits with the step, and the stepper never steals the ring.
  return (
    <button
      type="button"
      className={cn(
        "group/step grid size-[var(--nf-step)] flex-[0_0_var(--nf-step)] cursor-pointer select-none place-items-center rounded-[calc(var(--radius-md)-var(--nf-inset)-1px)] border-0 bg-transparent p-0 text-muted-foreground",
        "touch-manipulation [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent]",
        "transition-[background-color,color,opacity] duration-[var(--duration-quick)] ease-[var(--ease-out-quint)]",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:enabled:not-aria-disabled:bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:enabled:not-aria-disabled:text-foreground",
        // Quick press, spring release: the fill deepens and the glyph sinks. A held button stays pressed for as long as it repeats.
        "active:enabled:not-aria-disabled:bg-[color-mix(in_oklab,var(--color-foreground)_10%,var(--color-surface))] active:enabled:not-aria-disabled:text-foreground active:enabled:not-aria-disabled:[transition-duration:60ms]",
        "data-[pressed]:enabled:not-aria-disabled:bg-[color-mix(in_oklab,var(--color-foreground)_10%,var(--color-surface))] data-[pressed]:enabled:not-aria-disabled:text-foreground",
        "focus-visible:bg-muted focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        // At a limit the button dims and refuses, but stays in the tab order; pressing it strains the value toward the limit and it shakes once.
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-30 disabled:cursor-not-allowed disabled:opacity-35",
        "group-data-[strain=max]/ctl:last:aria-disabled:text-[var(--nf-limit)] group-data-[strain=max]/ctl:last:aria-disabled:opacity-60",
        "group-data-[strain=min]/ctl:first:aria-disabled:text-[var(--nf-limit)] group-data-[strain=min]/ctl:first:aria-disabled:opacity-60",
        "motion-reduce:transition-none"
      )}
      disabled={disabled}
      aria-controls={controls}
      aria-label={`${toward > 0 ? "Increase" : "Decrease"} ${label}`}
      aria-disabled={limit || undefined}
      data-pressed={pressed || undefined}
      onPointerDown={(event) => { if (event.button === 0) onPress(); }}
      onPointerUp={onRelease}
      onPointerLeave={onRelease}
      onPointerCancel={onRelease}
      onMouseDown={(event) => event.preventDefault()}
      onClick={(event) => { if (event.detail === 0) onActivate(); }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <span ref={iconRef} className="grid place-items-center">
        <Icon className="[transition:transform_var(--duration-spring)_var(--ease-spring)] group-active/step:scale-[.82] group-active/step:[transition:transform_90ms_var(--ease-out-quint)] group-data-[pressed]/step:scale-[.82] motion-reduce:!transform-none motion-reduce:transition-none" size={16} strokeWidth={1.75} aria-hidden="true" />
      </span>
    </button>
  );
}

/**
 * A bounded number with odometer digits. Buttons and arrow keys repeat and speed up while held, PageUp and PageDown take
 * large steps, Home and End jump to the limits, and `scrub` lets the label be dragged. Typing edits a plain draft that
 * applies live while valid; the rolling digits return once it commits on Enter, blur, or the next step.
 */
export function NumberField({ label, value, defaultValue = 0, onValueChange, min = 0, max = Number.MAX_SAFE_INTEGER, step: stepProp = 1, largeStep, description, disabled, id, prefix, suffix, scrub = false, locale = "en-US", formatOptions, size = "md", limitHint = true, className }: NumberFieldProps) {
  const reduced = useReducedMotion();
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const hintId = description ? `${inputId}-description` : undefined;
  const limitId = `${inputId}-limit`;
  const step = stepProp > 0 ? stepProp : 1;
  const [internal, setInternal] = React.useState(defaultValue);
  const current = value ?? internal;
  const [draft, setDraft] = React.useState("");
  const [editing, setEditing] = React.useState(false);
  const [pressed, setPressed] = React.useState(0);
  const [scrubbing, setScrubbing] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState("");
  /** The limit a press just met, shown for a moment; and whether a draft under the minimum has sat long enough to warn. */
  const [pushed, setPushed] = React.useState<1 | -1 | 0>(0);
  const [underWarn, setUnderWarn] = React.useState(false);
  const controlRef = React.useRef<HTMLDivElement>(null);
  const minusIcon = React.useRef<HTMLSpanElement>(null);
  const plusIcon = React.useRef<HTMLSpanElement>(null);
  const pushedTimer = React.useRef<number | undefined>(undefined);
  const underTimer = React.useRef<number | undefined>(undefined);
  const strainTimer = React.useRef<number | undefined>(undefined);
  const effort = React.useRef({ edge: 0, count: 0, at: 0 });
  const inputRef = React.useRef<HTMLInputElement>(null);
  const groupRef = React.useRef<HTMLSpanElement>(null);
  const latest = React.useRef(current);
  const editStart = React.useRef(current);
  const hold = React.useRef<number | undefined>(undefined);
  const drag = React.useRef<{ pointer: number; x: number; from: number; active: boolean } | null>(null);
  const suppressClick = React.useRef(false);
  const shiftFrom = React.useRef<number | null>(null);
  const selectNext = React.useRef(false);
  const live = React.useRef<(direction: 1 | -1, steps: number, source: Source) => boolean>(() => false);
  const bumpY = useMotionValue(0);
  const scrubX = useMotionValue(0);
  const shiftX = useMotionValue(0);
  const x = useTransform(() => scrubX.get() + shiftX.get());

  const base = Number.isFinite(min) ? min : 0;
  const decimals = Math.max(decimalsOf(step), decimalsOf(base));
  const minFraction = formatOptions?.minimumFractionDigits ?? decimals;
  const maxFraction = Math.max(minFraction, formatOptions?.maximumFractionDigits ?? decimals);
  const grouping = formatOptions?.useGrouping ?? true;
  const format = React.useMemo(() => new Intl.NumberFormat(locale, { minimumFractionDigits: minFraction, maximumFractionDigits: maxFraction, useGrouping: grouping, numberingSystem: "latn" }), [locale, minFraction, maxFraction, grouping]);
  const symbols = React.useMemo(() => {
    const parts = new Intl.NumberFormat(locale).formatToParts(-1234.5);
    return { group: parts.find((part) => part.type === "group")?.value ?? ",", decimal: parts.find((part) => part.type === "decimal")?.value ?? "." };
  }, [locale]);
  const round = (next: number) => Number(next.toFixed(decimals)) || 0;
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  const snap = (next: number) => round(base + Math.round((next - base) / step) * step);
  /** Off-grid values move to the next grid line in the direction of travel, then whole steps from there. */
  const stepFrom = (from: number, steps: number) => {
    const index = (from - base) / step;
    return round(base + ((steps > 0 ? Math.floor(index + 1e-7) : Math.ceil(index - 1e-7)) + steps) * step);
  };
  const spoken = (next: number) => `${affixText(prefix, next)}${format.format(next)}${affixText(suffix, next)}`.trim();
  function parse(text: string) {
    const normalized = text.split(symbols.group).join("").replace(symbols.decimal, ".").replace(/[^\d.-]/g, "");
    if (!/\d/.test(normalized)) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const typed = editing ? parse(draft) : null;
  const shown = typed ?? current;
  const [trail, setTrail] = React.useState({ value: shown, direction: 1 as 1 | -1 });
  if (trail.value !== shown) setTrail({ value: shown, direction: shown > trail.value ? 1 : -1 });
  const direction = trail.value === shown ? trail.direction : shown > trail.value ? 1 : -1;

  React.useEffect(() => () => {
    window.clearTimeout(hold.current);
    window.clearTimeout(pushedTimer.current);
    window.clearTimeout(underTimer.current);
    window.clearTimeout(strainTimer.current);
  }, []);

  /** A press past a limit. The value strains toward it and springs home, a little further with each push in a row (capped, like
   * overscroll); the refused button shakes once; the note names the limit. Reduced motion keeps only a brief color change. */
  function strain(edge: 1 | -1, source: Source) {
    const now = performance.now();
    const push = effort.current;
    push.count = push.edge === edge && now - push.at < PUSH_WINDOW ? push.count + 1 : 1;
    push.edge = edge;
    push.at = now;
    const control = controlRef.current;
    if (control) {
      control.dataset.strain = edge > 0 ? "max" : "min";
      window.clearTimeout(strainTimer.current);
      strainTimer.current = window.setTimeout(() => { delete control.dataset.strain; }, 420);
    }
    if (!reduced) {
      animate(bumpY, 0, { ...kick, velocity: -edge * BUMP_VELOCITY * (1 + Math.min(push.count - 1, PUSH_CAP) * PUSH_GAIN) });
      const icon = (edge > 0 ? plusIcon : minusIcon).current;
      if (icon && (source === "button" || source === "key")) animate(icon, { x: [0, -2.5, 2.5, -1.5, 1, 0] }, { duration: 0.32, ease: "easeOut" });
    }
    if (limitHint) {
      setPushed(edge);
      window.clearTimeout(pushedTimer.current);
      pushedTimer.current = window.setTimeout(() => setPushed(0), LIMIT_HINT_MS);
    }
  }
  /** Every change lands here. A value past a limit clamps, strains toward it, and says which limit it met. */
  function commitValue(next: number, source: Source) {
    if (!Number.isFinite(next)) return false;
    const clamped = clamp(next);
    const limit = Math.sign(next - clamped);
    if (limit && source !== "scrub") {
      strain(limit > 0 ? 1 : -1, source);
      setAnnouncement(`${spoken(clamped)}, ${limit > 0 ? "maximum" : "minimum"}`);
    } else if (source === "button" && clamped !== latest.current) setAnnouncement(spoken(clamped));
    if (clamped === latest.current) return false;
    latest.current = clamped;
    if (value === undefined) setInternal(clamped);
    onValueChange?.(clamped);
    return true;
  }
  const nudge = (toward: 1 | -1, steps: number, source: Source) => commitValue(stepFrom(latest.current, toward * steps), source);
  React.useLayoutEffect(() => { latest.current = current; live.current = nudge; });

  /** The group glides back to center when typing changes its width, instead of hopping half a character per key. */
  function captureShift() {
    const group = groupRef.current;
    if (group && shiftFrom.current === null) shiftFrom.current = group.getBoundingClientRect().left - scrubX.get() - shiftX.get();
  }
  React.useLayoutEffect(() => {
    const from = shiftFrom.current;
    const group = groupRef.current;
    shiftFrom.current = null;
    // After a commit the caret collapses to the end, so no selection box sits over the rolling digits.
    if (selectNext.current) {
      selectNext.current = false;
      const input = inputRef.current;
      if (input && document.activeElement === input) { const end = input.value.length; input.setSelectionRange(end, end); }
    }
    if (from === null || !group) return;
    const delta = from - (group.getBoundingClientRect().left - scrubX.get() - shiftX.get());
    if (Math.abs(delta) < 0.5) return;
    shiftX.set(shiftX.get() + delta);
    if (reduced) shiftX.jump(0);
    else animate(shiftX, 0, spring.morph);
  });

  function clearUnder() {
    window.clearTimeout(underTimer.current);
    setUnderWarn(false);
  }
  function commitDraft() {
    if (!editing) return;
    captureShift();
    setEditing(false);
    clearUnder();
    const parsed = parse(draft);
    if (parsed !== null) commitValue(snap(parsed), "type");
  }
  function stopHold() {
    window.clearTimeout(hold.current);
    hold.current = undefined;
    setPressed(0);
  }
  /** One step now; after a pause, repeats that speed up gently until release. Held into a limit, it keeps leaning on it at a
   * steady cadence, each push straining a little further, until the press lets go. */
  function startHold(toward: 1 | -1, amount: number, source: Source) {
    stopHold();
    commitDraft();
    const steps = Math.max(1, Math.round(amount / step));
    if (source === "button") setPressed(toward);
    let count = 0;
    const tick = () => {
      const moved = live.current(toward, steps, source);
      hold.current = window.setTimeout(tick, moved ? Math.max(HOLD_FASTEST, 150 * 0.86 ** ++count) : LIMIT_PUSH);
    };
    hold.current = window.setTimeout(tick, nudge(toward, steps, source) ? HOLD_DELAY : LIMIT_PUSH + 120);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const large = largeStep ?? step * 10;
    const move = ({ ArrowUp: [1, event.shiftKey ? large : step], ArrowDown: [-1, event.shiftKey ? large : step], PageUp: [1, large], PageDown: [-1, large] } as Record<string, [1 | -1, number]>)[event.key];
    if (move) { event.preventDefault(); if (!event.repeat) startHold(move[0], move[1], "key"); return; }
    // Home and End reach the limits; while a draft is open they move the caret as in any text field.
    if (!editing && ((event.key === "Home" && Number.isFinite(min)) || (event.key === "End" && max < Number.MAX_SAFE_INTEGER))) {
      event.preventDefault();
      commitValue(event.key === "Home" ? min : max, "key");
      return;
    }
    if (event.key === "Enter") { event.preventDefault(); if (editing) { selectNext.current = true; commitDraft(); } else event.currentTarget.select(); }
    if (event.key === "Escape" && editing) { event.preventDefault(); captureShift(); setEditing(false); clearUnder(); selectNext.current = true; commitValue(editStart.current, "type"); }
  }
  function onChange(text: string) {
    const allowed = new RegExp(`[^0-9${escape(symbols.group)}${decimals || maxFraction ? escape(symbols.decimal) : ""}${min < 0 ? "\\-" : ""}]`, "g");
    const next = text.replace(allowed, "");
    if (!editing) editStart.current = current;
    captureShift();
    setDraft(next);
    setEditing(true);
    // Valid drafts apply as they are typed, so anything that depends on the value follows along.
    const parsed = parse(next);
    if (parsed !== null && parsed >= min && parsed <= max && snap(parsed) === parsed) commitValue(parsed, "type");
    // Past the maximum warns at once; under the minimum waits, since "1" is often the start of "12".
    clearUnder();
    if (parsed !== null && parsed < min) underTimer.current = window.setTimeout(() => setUnderWarn(true), UNDER_WARN_MS);
  }

  function onScrubStart(event: React.PointerEvent<HTMLLabelElement>) {
    suppressClick.current = false;
    if (!scrub || disabled || event.button !== 0) return;
    commitDraft();
    drag.current = { pointer: event.pointerId, x: event.clientX, from: latest.current, active: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function onScrubMove(event: React.PointerEvent<HTMLLabelElement>) {
    const state = drag.current;
    if (!state || state.pointer !== event.pointerId) return;
    const dx = event.clientX - state.x;
    if (!state.active) { if (Math.abs(dx) < 3) return; state.active = true; setScrubbing(true); }
    const travel = dx / SCRUB_PX;
    const steps = Math.trunc(travel);
    commitValue(steps ? stepFrom(state.from, steps) : state.from, "scrub");
    // Past a limit the value follows the pointer with resistance, then springs back on release.
    const raw = state.from + travel * step;
    const over = raw > max ? ((raw - max) / step) * SCRUB_PX : raw < min ? ((raw - min) / step) * SCRUB_PX : 0;
    scrubX.set(reduced ? 0 : rubber(over));
  }
  function onScrubEnd(event: React.PointerEvent<HTMLLabelElement>) {
    const state = drag.current;
    if (!state || state.pointer !== event.pointerId) return;
    drag.current = null;
    if (!state.active) return;
    suppressClick.current = true;
    setScrubbing(false);
    animate(scrubX, 0, reduced ? { duration: 0 } : spring.snappy);
    setAnnouncement(spoken(latest.current));
  }

  const stepper = (toward: 1 | -1) => ({ toward, label, disabled, controls: inputId, limit: toward > 0 ? shown >= max : shown <= min, pressed: pressed === toward });
  /** A typed value past a limit holds a calm warning until it commits and springs back. */
  const outside: 1 | -1 | 0 = typed === null ? 0 : typed > max ? 1 : typed < min && underWarn ? -1 : 0;
  const noteEdge = limitHint ? outside || pushed : 0;
  const noteLimit = noteEdge > 0 ? max : min;
  const noteText = !noteEdge ? "" : typeof limitHint === "function" ? limitHint(noteEdge > 0 ? "max" : "min", noteLimit) : `${noteEdge > 0 ? "Max" : "Min"} ${spoken(noteLimit)}`;
  const describedBy = [hintId, outside && limitHint ? limitId : undefined].filter(Boolean).join(" ") || undefined;

  return (
    // No row gap: grid tracks clamp a negative margin at zero, so a closed message row would still pay the gap.
    <div
      className={cn(
        "grid min-w-0 [--nf-limit:color-mix(in_oklab,var(--color-warning)_72%,var(--color-foreground))] dark:[--nf-limit:color-mix(in_oklab,var(--color-warning)_88%,var(--color-foreground))]",
        sizes[size],
        className
      )}
      data-size={size}
    >
      {/* The label row matches the control's width, so the limit note sits over the stepper it answers. */}
      <div className="mb-2 flex w-[min(100%,var(--nf-width))] items-baseline justify-between gap-3">
        <label
          htmlFor={inputId}
          className={cn(fieldLabel, "mb-0 min-w-0", size === "sm" && "text-xs", scrub && !disabled && "cursor-ew-resize touch-pan-y select-none [-webkit-user-select:none]")}
          onPointerDown={onScrubStart}
          onPointerMove={onScrubMove}
          onPointerUp={onScrubEnd}
          onPointerCancel={onScrubEnd}
          onClick={(event) => { if (suppressClick.current) { event.preventDefault(); suppressClick.current = false; } }}
        >
          {label}
        </label>
        <LimitNote id={limitId} edge={noteEdge} text={noteText} />
      </div>
      <div
        ref={controlRef}
        className={cn(
          "group/ctl flex min-h-[var(--nf-height)] w-[min(100%,var(--nf-width))] items-center gap-0.5 rounded-[var(--radius-md)] border bg-surface p-[var(--nf-inset)]",
          "transition-[border-color,background-color,opacity,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
          "has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/25",
          outside
            ? "border-[color-mix(in_oklab,var(--color-warning)_55%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-warning)_5%,var(--color-surface))] has-[input:focus]:border-[color-mix(in_oklab,var(--color-warning)_80%,var(--color-border))]"
            : scrubbing
              ? "border-foreground"
              : "border-border [@media(hover:hover)_and_(pointer:fine)]:hover:border-border-strong",
          disabled && "bg-muted opacity-50"
        )}
        data-scrubbing={scrubbing || undefined}
        data-disabled={disabled || undefined}
        data-warn={outside ? (outside > 0 ? "max" : "min") : undefined}
      >
        <StepButton {...stepper(-1)} iconRef={minusIcon} onPress={() => startHold(-1, step, "button")} onRelease={stopHold} onActivate={() => { commitDraft(); nudge(-1, 1, "button"); }} />
        <div
          className={cn("relative flex min-w-0 flex-1 cursor-text items-center justify-center self-stretch", disabled && "cursor-not-allowed")}
          onMouseDown={(event) => { if (event.target !== inputRef.current) event.preventDefault(); }}
          onClick={(event) => { if (!disabled && event.target !== inputRef.current) { inputRef.current?.focus(); inputRef.current?.select(); } }}
        >
          {/* The number, its prefix, and its suffix travel as one centered group. Tabular digits keep every column the same width. */}
          <motion.span
            ref={groupRef}
            className="inline-flex items-center text-[length:var(--nf-text)] font-medium leading-snug tracking-[-0.01em] whitespace-nowrap tabular-nums text-foreground transition-colors duration-[var(--duration-standard)] motion-reduce:group-data-[strain]/ctl:text-[var(--nf-limit)] motion-reduce:transition-none"
            style={{ x, y: bumpY }}
          >
            <AffixText text={affixText(prefix, shown)} direction={direction} />
            {/* The rolling digits and the real input share one cell. The input only draws the caret and selection; its text is always painted by a span
                (the digits, or the draft mirror while typing), so the value keeps one weight and position whether it is rolling or being edited. */}
            <span className="relative inline-grid items-center">
              <span className={cn("inline-flex [grid-area:1/1]", editing && "invisible absolute top-0 left-0")} aria-hidden="true">
                <Digits value={shown} format={format} direction={direction} instant={editing} />
              </span>
              {editing && <span className="whitespace-pre [grid-area:1/1]" aria-hidden="true">{draft}</span>}
              <input
                ref={inputRef}
                id={inputId}
                className="absolute top-0 left-0 z-1 m-0 h-full w-[calc(100%+1em)] border-0 bg-transparent p-0 text-left text-transparent caret-foreground outline-none [font:inherit] [font-variant-numeric:inherit] [letter-spacing:inherit] [line-height:inherit] selection:bg-[color-mix(in_oklab,var(--color-foreground)_16%,transparent)] selection:text-transparent disabled:cursor-not-allowed"
                type="text"
                role="spinbutton"
                inputMode={min < 0 ? "text" : decimals || maxFraction ? "decimal" : "numeric"}
                autoComplete="off"
                spellCheck={false}
                value={editing ? draft : format.format(current)}
                disabled={disabled}
                aria-describedby={describedBy}
                aria-invalid={outside ? true : undefined}
                aria-valuenow={current}
                aria-valuetext={spoken(current)}
                aria-valuemin={Number.isFinite(min) ? min : undefined}
                aria-valuemax={max < Number.MAX_SAFE_INTEGER ? max : undefined}
                onChange={(event) => onChange(event.currentTarget.value)}
                onKeyDown={onKeyDown}
                onKeyUp={(event) => { if (/^(Arrow(Up|Down)|Page(Up|Down))$/.test(event.key)) stopHold(); }}
                onBlur={() => { stopHold(); commitDraft(); }}
              />
            </span>
            <AffixText text={affixText(suffix, shown)} direction={direction} />
          </motion.span>
        </div>
        <StepButton {...stepper(1)} iconRef={plusIcon} onPress={() => startHold(1, step, "button")} onRelease={stopHold} onActivate={() => { commitDraft(); nudge(1, 1, "button"); }} />
      </div>
      <FieldMessage id={hintId} text={description} />
      <span className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</span>
    </div>
  );
}
