import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { easeEnter, easeStandard } from "./motion";

/** Label above a field. */
export const fieldLabel = "mb-2 text-sm font-medium leading-snug text-foreground";

/** The focus language shared by every field: the border darkens and a soft ring appears; the box never changes size. */
export const focusRing = "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/25";

/** Bordered surface that wraps an input and its adornments. Pass `invalid` to color the border. */
export const fieldShell = (invalid?: boolean) =>
  [
    "flex min-h-10 min-w-0 items-center rounded-[var(--radius-md)] border bg-surface",
    "transition-[border-color,box-shadow,background-color] duration-[var(--duration-quick)] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
    focusRing,
    invalid
      ? "border-destructive focus-within:border-destructive focus-within:ring-destructive/25"
      : "border-border-strong [@media(hover:hover)_and_(pointer:fine)]:hover:not-focus-within:border-foreground",
    "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-muted has-[input:disabled]:opacity-60",
  ].join(" ");

/** An input with no chrome of its own, for use inside a shell. */
export const bareInput =
  "w-full min-w-0 border-0 bg-transparent p-0 font-[inherit] text-sm leading-snug tracking-[-0.01em] text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed";

/** A self-contained input control: border, focus ring, invalid and disabled states. */
export const inputControl = [
  "w-full min-h-10 rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 font-[inherit] text-sm leading-snug tracking-[-0.01em] text-foreground outline-none",
  "placeholder:text-muted-foreground",
  "transition-[border-color,box-shadow,background-color] duration-[var(--duration-quick)] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:enabled:not-aria-invalid:not-focus-visible:border-foreground",
  "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
].join(" ");

/** Small round icon button used inside shells (reveal, clear, steppers). */
export const adornmentButton = [
  "grid size-[30px] flex-none place-items-center rounded-[var(--radius-md)] border-0 bg-transparent text-muted-foreground cursor-pointer",
  "[transition:background-color_var(--duration-quick)_var(--ease-out-quint),color_var(--duration-quick)_var(--ease-out-quint),transform_var(--duration-spring)_var(--ease-spring)]",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground",
  "active:scale-[.96] active:[transition-duration:var(--duration-quick),var(--duration-quick),100ms]",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "motion-reduce:transition-none motion-reduce:active:scale-100",
].join(" ");

const digit = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * 0.6}em`, filter: `blur(${blur.subtle}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -0.6}em`, filter: `blur(${blur.subtle}px)` }),
};
const isNumber = (word: string) => /^\d[\d.,/:]*%?$/.test(word);

/** A count in the copy, such as "12 characters", rolls only the digits that changed; a gained or lost digit opens or closes its width. */
function RollingNumber({ word }: { word: string }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = React.useState({ word, direction: 1 });
  if (shown.word !== word) {
    setShown({ word, direction: parseFloat(word.replace(/,/g, "")) < parseFloat(shown.word.replace(/,/g, "")) ? -1 : 1 });
  }
  const characters = word.split("");
  const transition = reduced
    ? { duration: 0 }
    : { y: spring.snappy, width: spring.morph, opacity: { duration: duration.fast }, filter: { duration: duration.fast } };
  return (
    <AnimatePresence initial={false}>
      {characters.map((character, index) => (
        <motion.span
          key={characters.length - index}
          className="relative inline-flex justify-center tabular-nums"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={transition as never}
        >
          <AnimatePresence initial={false} mode="popLayout" custom={shown.direction}>
            <motion.span key={character} className="inline-block" custom={shown.direction} variants={digit} initial="enter" animate="center" exit="exit" transition={transition as never}>
              {character}
            </motion.span>
          </AnimatePresence>
        </motion.span>
      ))}
    </AnimatePresence>
  );
}

/** Changed words rise in and unblur while unchanged words hold still, and numbers roll. Assistive tech reads the plain copy. */
export function MotionText({ text, rollNumbers = true }: { text: string; rollNumbers?: boolean }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="relative block" aria-hidden="true">
        <AnimatePresence initial={false} mode="popLayout">
          {words.map((word, index) => (
            <motion.span
              key={`${index}:${rollNumbers && isNumber(word) ? "#" : word}`}
              className="inline-block whitespace-pre"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: `blur(${blur.soft}px)` }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.35em", filter: `blur(${blur.subtle}px)`, transition: { duration: 0.18, ease: easeStandard } }}
              transition={reduced ? { duration: duration.instant } : { duration: duration.standard, ease: easeEnter }}
            >
              {rollNumbers && isNumber(word) ? <RollingNumber word={word} /> : word}
              {index < words.length - 1 ? " " : null}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
    </>
  );
}

/** The row tracks the measured copy, so a longer message that wraps opens its next line instead of snapping. */
function MessageRow({ id, text, className, alert, rollNumbers }: { id?: string; text: string; className: string; alert?: boolean; rollNumbers?: boolean }) {
  const reduced = useReducedMotion();
  const copyRef = React.useRef<HTMLSpanElement>(null);
  const [height, setHeight] = React.useState<number | "auto">("auto");
  React.useEffect(() => {
    const node = copyRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  // Reduced motion mounts the row at full height: a zero-duration open would still paint one collapsed frame.
  return (
    <motion.span
      className="block overflow-hidden"
      initial={reduced ? false : { height: 0, opacity: 0 }}
      animate={{ height, opacity: 1 }}
      exit={{ height: 0, opacity: 0, transition: reduced ? { duration: 0 } : { height: spring.smooth, opacity: { duration: duration.instant } } }}
      transition={reduced ? { duration: 0 } : { height: spring.smooth, opacity: { duration: duration.fast } }}
    >
      <motion.span
        ref={copyRef}
        id={id}
        className={className}
        role={alert ? "alert" : undefined}
        initial={reduced ? false : { y: "0.35em", filter: `blur(${blur.soft}px)` }}
        animate={{ y: 0, filter: "blur(0px)" }}
        transition={{ duration: reduced ? 0 : duration.standard, ease: easeEnter }}
      >
        <MotionText text={text} rollNumbers={rollNumbers} />
      </motion.span>
    </motion.span>
  );
}

export const messageClass = {
  description: "block pt-2 text-xs leading-snug text-muted-foreground",
  error: "block pt-2 text-xs leading-snug text-destructive",
} as const;

/**
 * Helper and error copy: the row opens its height on a spring, then the words settle in.
 * There is no row gap in the parent grid, so a closed message row costs no space.
 */
export function FieldMessage({ id, text, tone = "description", rollNumbers = true }: { id?: string; text?: string; tone?: keyof typeof messageClass; rollNumbers?: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {text ? <MessageRow key="message" id={id} text={text} className={messageClass[tone]} alert={tone === "error"} rollNumbers={rollNumbers} /> : null}
    </AnimatePresence>
  );
}

/** Joins aria-describedby ids, dropping empties. */
export const describedBy = (...ids: Array<string | undefined | false>) => ids.filter(Boolean).join(" ") || undefined;
