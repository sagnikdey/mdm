import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { AnimationPlaybackControls, Transition, Variants } from "motion/react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { FieldMessage, adornmentButton, bareInput, fieldLabel, fieldShell } from "../../lib/field";
import { easeEnter, easeStandard } from "../../lib/motion";

export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
  /** Characters still missing. Shown as a rolling count beside the rule while it is unmet. */
  remaining?: (password: string) => number;
}

export interface PasswordStrengthResult {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  met: string[];
}

/**
 * A new password field that shows how strong the password is while it is typed: four segments fill and change tone,
 * each rule checks off with a drawn tick, and the strength word morphs in place. Use it when creating or changing a password;
 * use a plain password field for sign in. Scoring happens on the device, nothing is sent anywhere.
 */
export interface PasswordStrengthProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "children"> {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, strength: PasswordStrengthResult) => void;
  /** Rules to check. Strength is the share of rules met, spread over four steps. */
  rules?: PasswordRule[];
  /** Error copy tied to the field. The field shakes once each time a new error appears. */
  error?: string;
  revealed?: boolean;
  onRevealedChange?: (revealed: boolean) => void;
}

const count = (password: string) => Array.from(password).length;
export const defaultPasswordRules: PasswordRule[] = [
  { id: "length", label: "At least 12 characters", test: (password) => count(password) >= 12, remaining: (password) => Math.max(0, 12 - count(password)) },
  { id: "case", label: "Upper and lowercase letters", test: (password) => /\p{Ll}/u.test(password) && /\p{Lu}/u.test(password) },
  { id: "number", label: "At least one number", test: (password) => /\p{N}/u.test(password) },
  { id: "symbol", label: "At least one symbol", test: (password) => /[^\p{L}\p{N}\s]/u.test(password) },
];

const LEVELS = ["", "Weak", "Fair", "Good", "Strong"] as const;
/** Below this length a password stays at the first step, however varied its characters are. */
const SHORT = 8;

/** Scores a password on the device: one step per share of rules met, capped at the first step while it is shorter than eight characters. */
export function estimateStrength(password: string, rules: PasswordRule[] = defaultPasswordRules): PasswordStrengthResult {
  if (!password) return { level: 0, label: "", met: [] };
  const met = rules.filter((rule) => rule.test(password)).map((rule) => rule.id);
  if (count(password) < SHORT) return { level: 1, label: "Too short", met };
  const level = Math.min(4, Math.max(1, Math.round((met.length / Math.max(rules.length, 1)) * 4))) as 1 | 2 | 3 | 4;
  return { level, label: LEVELS[level], met };
}

const subscribe = () => () => {};
/** False on the server and during hydration, so reduced motion never changes the first client render. */
const useHydrated = () => React.useSyncExternalStore(subscribe, () => true, () => false);

/** The word rises when strength improves and drops when it falls, so the direction reads without looking at the meter. */
const rise: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${0.3 * direction}em`, filter: `blur(${blur.soft}px)` }),
  center: { opacity: 1, y: "0em", filter: "blur(0px)", transition: { duration: duration.standard, ease: easeEnter } },
  exit: (direction: number) => ({ opacity: 0, y: `${-0.3 * direction}em`, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.quick, ease: easeStandard } }),
};
const fade: Variants = { enter: { opacity: 0 }, center: { opacity: 1, transition: { duration: duration.quick } }, exit: { opacity: 0, transition: { duration: duration.instant } } };
/** Digits turn like a counter: a shrinking count drops in from above, a growing one rises from below. */
const roll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${0.45 * direction}em`, filter: `blur(${blur.subtle}px)` }),
  center: { opacity: 1, y: "0em", filter: "blur(0px)", transition: { y: spring.snappy, opacity: { duration: duration.quick }, filter: { duration: duration.quick } } as Transition },
  exit: (direction: number) => ({ opacity: 0, y: `${-0.45 * direction}em`, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.quick, ease: easeStandard } }),
};

function RollingNumber({ value, reduced }: { value: number; reduced: boolean }) {
  const [track, setTrack] = React.useState({ value, direction: 1 });
  if (track.value !== value) setTrack({ value, direction: value > track.value ? 1 : -1 });
  const digits = String(value).split("");
  // Columns are keyed by place value, so 10 → 9 lets the tens column narrow away while the ones column turns.
  return (
    <span className="inline-flex tabular-nums">
      <AnimatePresence initial={false} custom={track.direction}>
        {digits.map((digit, index) => (
          <motion.span
            key={digits.length - 1 - index}
            className="relative inline-block overflow-x-clip"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : ({ width: spring.morph, opacity: { duration: duration.quick } } as Transition)}
          >
            <AnimatePresence mode="popLayout" initial={false} custom={track.direction}>
              <motion.span key={digit} className="inline-block" custom={track.direction} variants={reduced ? fade : roll} initial="enter" animate="center" exit="exit">{digit}</motion.span>
            </AnimatePresence>
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

/** One eye that a slash draws across, cutting the outline beneath it, instead of swapping two icons. */
function EyeMorph({ slashed, reduced }: { slashed: boolean; reduced: boolean }) {
  const maskId = `eye-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const slash = { pathLength: slashed ? 1 : 0, opacity: slashed ? 1 : 0 };
  const transition: Transition = reduced ? { duration: 0 } : { pathLength: { duration: duration.standard, ease: easeStandard }, opacity: { duration: duration.instant } };
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="white" stroke="none" />
        <motion.path d="M3 3l18 18" stroke="black" strokeWidth={5} initial={false} animate={slash} transition={transition} />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </g>
      <motion.path d="M3 3l18 18" initial={false} animate={slash} transition={transition} />
    </svg>
  );
}

/** The tint grows under the tick while the tick draws from its short stroke; unchecking retracts it faster than it drew. */
function RuleMark({ met, delay, reduced }: { met: boolean; delay: number; reduced: boolean }) {
  return (
    <span className="relative block size-4 flex-[0_0_16px] rounded-full border-[1.25px] border-border-strong text-success transition-colors duration-[var(--duration-quick)] group-data-[met]/rule:border-transparent motion-reduce:transition-none" aria-hidden="true">
      <motion.span
        className="absolute -inset-[1.25px] rounded-[inherit] bg-[color-mix(in_oklab,var(--color-success)_16%,transparent)]"
        initial={false}
        animate={{ scale: met ? 1 : 0.5, opacity: met ? 1 : 0 }}
        transition={reduced ? { duration: 0 } : ({ scale: { ...spring.snappy, delay }, opacity: { duration: met ? duration.quick : duration.instant, delay } } as Transition)}
      />
      <svg className="absolute -inset-[1.25px] size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M4.75 8.25 7 10.5l4.25-4.75"
          initial={false}
          animate={{ pathLength: met ? 1 : 0, opacity: met ? 1 : 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : met
                ? { pathLength: { duration: duration.standard, ease: easeEnter, delay: delay + 0.06 }, opacity: { duration: 0.05, delay: delay + 0.06 } }
                : { pathLength: { duration: duration.quick, ease: easeStandard }, opacity: { duration: duration.quick, delay: 0.06 } }
          }
        />
      </svg>
    </span>
  );
}

export const PasswordStrength = React.forwardRef<HTMLInputElement, PasswordStrengthProps>(function PasswordStrength(
  { label, value: valueProp, defaultValue = "", onValueChange, onChange, rules = defaultPasswordRules, error, revealed: revealedProp, onRevealedChange, id, className, ...props },
  ref
) {
  const generated = React.useId();
  const controlId = id ?? generated;
  const rulesId = `${controlId}-rules`;
  const errorId = `${controlId}-error`;
  const hydrated = useHydrated();
  const prefersReduced = useReducedMotion();
  const reduced = hydrated && !!prefersReduced;
  const [internal, setInternal] = React.useState(defaultValue);
  const value = valueProp ?? internal;
  const [revealedInternal, setRevealedInternal] = React.useState(false);
  const revealed = revealedProp ?? revealedInternal;
  const strength = estimateStrength(value, rules);
  const met = new Set(strength.met);

  // The previous level and rule states tell which way the word moves and which segments and ticks join a staggered wave.
  const rank = strength.label === "Too short" ? 0.5 : strength.level;
  const metKey = strength.met.join(" ");
  const [track, setTrack] = React.useState({ rank, level: strength.level, previousLevel: strength.level, direction: 1, metKey, previousMet: metKey });
  if (track.rank !== rank || track.metKey !== metKey) {
    setTrack({
      rank,
      level: strength.level,
      previousLevel: track.rank !== rank ? track.level : track.previousLevel,
      direction: track.rank === rank ? track.direction : rank > track.rank ? 1 : -1,
      metKey,
      previousMet: track.metKey !== metKey ? track.metKey : track.previousMet,
    });
  }
  const previousMet = new Set(track.previousMet.split(" ").filter(Boolean));
  const changed = rules.filter((rule) => met.has(rule.id) !== previousMet.has(rule.id)).map((rule) => rule.id);

  // Only a change after mount resolves the text, so the field never blurs in on first paint.
  const [reveal, setReveal] = React.useState({ revealed, changed: false });
  if (reveal.revealed !== revealed) setReveal({ revealed, changed: true });

  const shake = useMotionValue(0);
  const shaking = React.useRef<AnimationPlaybackControls | null>(null);
  const lastError = React.useRef(error);
  React.useEffect(() => {
    const previous = lastError.current;
    lastError.current = error;
    if (!error || error === previous || reduced) return;
    // A spring released with sideways velocity rings out on its own, the way a refused field shakes on a phone.
    shaking.current?.stop();
    shaking.current = animate(shake, 0, { type: "spring", velocity: -240, stiffness: 900, damping: 15, restDelta: 0.1 });
  }, [error, reduced, shake]);

  function toggleReveal() {
    if (revealedProp === undefined) setRevealedInternal(!revealed);
    onRevealedChange?.(!revealed);
  }

  const summary = strength.level ? `Strength: ${strength.label}. ${strength.met.length} of ${rules.length} requirements met.` : "";
  const describedBy = [props["aria-describedby"], error ? errorId : undefined, rulesId].filter(Boolean).join(" ");

  return (
    <div
      className="grid min-w-0 [--tone:var(--color-border-strong)] data-[level=1]:[--tone:var(--color-destructive)] data-[level=2]:[--tone:var(--color-warning)] data-[level=3]:[--tone:var(--color-success)] data-[level=4]:[--tone:var(--color-success)]"
      data-level={strength.level}
    >
      <label className={fieldLabel} htmlFor={controlId}>{label}</label>
      {/* The shell only transitions color; its sideways shake is a spring on transform, so the two never fight. */}
      <motion.div className={cn(fieldShell(!!error), "gap-1 pr-[5px] pl-4")} style={{ x: shake }}>
        <input
          autoComplete="new-password"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          {...props}
          ref={ref}
          id={controlId}
          type={revealed ? "text" : "password"}
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            if (valueProp === undefined) setInternal(next);
            onChange?.(event);
            onValueChange?.(next, estimateStrength(next, rules));
          }}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={describedBy}
          data-reveal={reveal.changed ? (revealed ? "shown" : "hidden") : undefined}
          // Touch keyboards zoom into fields under 16px, so coarse pointers get the larger size.
          className={cn(bareInput, "h-[38px] data-[reveal]:animate-[sg-resolve_var(--duration-standard)_var(--ease-enter)] [@media(pointer:coarse)]:text-base motion-reduce:animate-none", className)}
        />
        <button type="button" className={cn(adornmentButton, "size-[34px]", revealed && "text-foreground")} onClick={toggleReveal} aria-label="Show password" aria-pressed={revealed} aria-controls={controlId}>
          <EyeMorph slashed={revealed} reduced={reduced} />
        </button>
      </motion.div>
      <FieldMessage id={errorId} text={error} tone="error" rollNumbers={false} />
      <div className="mt-3 flex items-center gap-3">
        <div className="grid min-w-0 flex-[1_1_auto] grid-cols-4 gap-[5px]" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={4} aria-valuenow={strength.level} aria-valuetext={strength.level ? strength.label : "No password yet"}>
          {[0, 1, 2, 3].map((index) => {
            const on = index < strength.level;
            // A pasted password fills left to right; clearing empties right to left.
            const wave = on ? index - track.previousLevel : track.previousLevel - 1 - index;
            return (
              // Each fill slides in from the left inside its clipped track, so the rounded ends keep their shape at every frame.
              <span key={index} className="relative isolate h-1 overflow-hidden rounded-full bg-border">
                <motion.span
                  className="absolute inset-0 rounded-[inherit] bg-[var(--tone)] transition-colors duration-[var(--duration-standard)] motion-reduce:transition-none"
                  initial={false}
                  animate={{ x: on ? "0%" : "-101%" }}
                  transition={reduced ? { duration: 0 } : ({ ...spring.smooth, delay: Math.max(0, wave) * (on ? 0.05 : 0.03) } as Transition)}
                />
              </span>
            );
          })}
        </div>
        {/* A fixed slot: the meter never resizes when the word changes, and the word stays flush with the field's edge. */}
        <span className="relative block h-[1.4em] flex-[0_0_4.5rem] text-right text-sm font-medium leading-snug whitespace-nowrap text-foreground" aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false} custom={track.direction}>
            {strength.level ? (
              <motion.span key={strength.label} className="inline-block" custom={track.direction} variants={reduced ? fade : rise} initial="enter" animate="center" exit="exit">
                {strength.label}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      </div>
      <ul id={rulesId} className="m-0 mt-4 grid list-none gap-1.5 p-0" aria-label="Password requirements">
        {rules.map((rule) => {
          const ok = met.has(rule.id);
          const remaining = value && !ok ? rule.remaining?.(value) ?? 0 : 0;
          const order = changed.indexOf(rule.id);
          return (
            <li key={rule.id} className="group/rule flex min-h-5 items-center gap-2.5 text-sm leading-snug text-muted-foreground transition-colors duration-[var(--duration-standard)] data-[met]:text-foreground motion-reduce:transition-none" data-met={ok || undefined}>
              <RuleMark met={ok} delay={order > 0 ? order * 0.05 : 0} reduced={reduced} />
              <span className="min-w-0">
                {rule.label}
                <span className="sr-only">{ok ? ", met" : ", not met"}</span>
              </span>
              <span className="relative ml-auto block pl-2 text-xs whitespace-nowrap text-muted-foreground" aria-hidden="true">
                <AnimatePresence mode="popLayout" initial={false} custom={1}>
                  {remaining > 0 ? (
                    <motion.span key="remaining" className="inline-flex items-baseline gap-[.28em]" custom={1} variants={reduced ? fade : rise} initial="enter" animate="center" exit="exit">
                      <RollingNumber value={remaining} reduced={reduced} /> more
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </span>
            </li>
          );
        })}
      </ul>
      <span className="sr-only" role="status">{summary}</span>
    </div>
  );
});
PasswordStrength.displayName = "PasswordStrength";
