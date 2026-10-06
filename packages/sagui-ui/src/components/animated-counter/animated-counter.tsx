import * as React from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type MotionValue, type Variants } from "motion/react";
import { blur, duration, spring, stagger } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";

export interface AnimatedCounterProps {
  value: number;
  /** Small label above the number. */
  label?: string;
  prefix?: string;
  suffix?: string;
  /** Fixed fraction digits. */
  decimals?: number;
  /** Roll every digit up from zero the first time the counter scrolls into view. */
  animateOnView?: boolean;
  /** Formatting locale. Fixed by default so server and client render the same digits. */
  locale?: string;
  className?: string;
}

type Part = { key: string; digit: number; order: number } | { key: string; text: string };

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const rise: Variants = {
  hidden: { opacity: 0, y: "0.3em", filter: `blur(${blur.soft}px)` },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.standard, ease: easeEnter } },
  gone: { opacity: 0, y: "-0.3em", filter: `blur(${blur.subtle}px)`, transition: { duration: duration.quick, ease: easeStandard } },
};
const fade: Variants = { hidden: { opacity: 0, y: 0, filter: "blur(0px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.instant } }, gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: duration.instant } } };
const reveal = { ...spring.smooth, visualDuration: duration.considered };

/** Split a formatted number into columns keyed by place value, so 999 → 1,000 keeps the ones column the ones column. */
function partsFor(value: number, decimals: number, locale: string): Part[] {
  const parts = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals, numberingSystem: "latn" }).formatToParts(value);
  let place = parts.reduce((count, part) => count + (part.type === "integer" ? part.value.length : 0), 0);
  let fraction = 0;
  let order = 0;
  return parts.flatMap((part, index): Part[] => {
    if (part.type === "integer") return [...part.value].map((char) => ({ key: `i${--place}`, digit: Number(char), order: order++ }));
    if (part.type === "fraction") return [...part.value].map((char) => ({ key: `f${fraction++}`, digit: Number(char), order: order++ }));
    return [{ key: part.type === "group" ? `g${place}` : part.type === "decimal" ? "d" : `${part.type}${index}`, text: part.value }];
  });
}

/** One digit on the wheel. Its offset from the wheel position decides where it sits and how visible it is. */
function Glyph({ position, digit }: { position: MotionValue<number>; digit: number }) {
  const offset = useTransform(position, (current) => ((((digit - current) % 10) + 15) % 10) - 5);
  const y = useTransform(offset, (current) => `${current}em`);
  const opacity = useTransform(offset, (current) => Math.max(0, 1 - Math.abs(current)));
  const visibility = useTransform(offset, (current) => (Math.abs(current) >= 1 ? "hidden" : "visible"));
  const filter = useTransform(offset, (current) => (Math.abs(current) < 0.02 || Math.abs(current) >= 1 ? "none" : `blur(${(Math.abs(current) * blur.subtle).toFixed(2)}px)`));
  return <motion.span className="absolute inset-x-0 inset-y-[var(--feather)] text-center" style={{ y, opacity, filter, visibility }}>{digit}</motion.span>;
}

const presence = { initial: { width: 0, opacity: 0 }, animate: { width: "auto", opacity: 1 }, exit: { width: 0, opacity: 0 } };

/** A digit wheel. It always turns in the direction the whole number moved, wrapping 9 → 0 like an odometer. */
function Column({ digit, direction, armed, delay, reduceMotion }: { digit: number; direction: number; armed: boolean; delay: number; reduceMotion: boolean }) {
  const position = useMotionValue(armed ? 0 : digit);
  const wheel = React.useRef({ digit: armed ? 0 : digit, target: armed ? 0 : digit, revealed: !armed });
  React.useEffect(() => {
    const state = wheel.current;
    if (armed || state.digit === digit) { if (!armed) state.revealed = true; return; }
    state.target += direction < 0 && state.revealed ? -((state.digit - digit + 10) % 10) : (digit - state.digit + 10) % 10;
    state.digit = digit;
    if (reduceMotion) position.jump(state.target);
    else animate(position, state.target, state.revealed ? spring.smooth : ({ ...reveal, delay } as never));
    state.revealed = true;
  }, [armed, delay, digit, direction, position, reduceMotion]);
  return (
    // The wheel's window reaches a little past the line box and feathers out, so a turning digit fades at the edge instead of being cut.
    <motion.span
      className="relative inline-block overflow-hidden -my-[var(--feather)] py-[var(--feather)] [--feather:.16em] [mask-image:linear-gradient(to_bottom,transparent,#000_calc(var(--feather)*1.5),#000_calc(100%-var(--feather)*1.5),transparent)]"
      {...presence}
      transition={reduceMotion ? { duration: 0 } : (spring.morph as never)}
    >
      <span className="invisible">0</span>
      {DIGITS.map((item) => <Glyph key={item} position={position} digit={item} />)}
    </motion.span>
  );
}

/** An odometer style number whose digit columns roll to each new value. */
export function AnimatedCounter({ value, label, prefix = "", suffix = "", decimals = 0, animateOnView = false, locale = "en-US", className }: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = !!useReducedMotion();
  const [previous, setPrevious] = React.useState(value);
  const [direction, setDirection] = React.useState(1);
  if (value !== previous) { setPrevious(value); setDirection(value > previous ? 1 : -1); }
  const parts = partsFor(value, decimals, locale);
  const text = `${prefix}${parts.map((part) => ("text" in part ? part.text : part.digit)).join("")}${suffix}`;
  const armed = animateOnView && !inView;
  return (
    <span ref={ref} className={cn("relative inline-flex flex-col text-4xl font-medium leading-none tracking-[-0.03em] tabular-nums text-foreground", className)}>
      {label && (
        <span className="mb-2 text-xs font-normal leading-snug tracking-[-0.01em] text-muted-foreground">
          <span className="relative block">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={label} className="inline-block" variants={reduceMotion ? fade : rise} initial="hidden" animate="shown" exit="gone">{label}</motion.span>
            </AnimatePresence>
          </span>
        </span>
      )}
      <span className="sr-only">{text}</span>
      {/* Each digit is a clipped wheel; separators clip sideways only so a comma keeps its tail. */}
      <span className="inline-flex select-none items-start whitespace-nowrap" aria-hidden="true">
        {prefix && <span className="inline-block overflow-x-clip">{prefix}</span>}
        <AnimatePresence initial={false}>
          {parts.map((part) =>
            "digit" in part ? (
              <Column key={part.key} digit={part.digit} direction={direction} armed={armed} delay={Math.min(part.order * stagger.item, 0.25)} reduceMotion={reduceMotion} />
            ) : (
              <motion.span key={part.key} className="inline-block overflow-x-clip" {...presence} transition={reduceMotion ? { duration: 0 } : (spring.morph as never)}>{part.text}</motion.span>
            )
          )}
        </AnimatePresence>
        {suffix && <span className="inline-block overflow-x-clip">{suffix}</span>}
      </span>
    </span>
  );
}
