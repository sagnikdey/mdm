import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { HeightFrame } from "../../lib/height-frame";
import { easeEnter, easeStandard, iconEnter, iconIn } from "../../lib/motion";
import { Button } from "../button/button";

export interface ApprovalOption {
  value: string;
  label: string;
}

export interface ApprovalQuestion {
  id: string;
  question: string;
  options: ApprovalOption[];
  /** `single` picks one with radios and moves on; `multiple` picks any number with checkboxes. Defaults to single. */
  type?: "single" | "multiple";
  /** Adds a free text row under the options. Defaults to true. */
  allowOther?: boolean;
  otherPlaceholder?: string;
}

/** One answer per question id: the chosen values plus any free text, or null when the question was skipped. */
export type ApprovalAnswer = { values: string[]; other: string } | null;
export type ApprovalAnswers = Record<string, ApprovalAnswer>;

export interface ApprovalCardProps {
  questions: ApprovalQuestion[];
  /** Runs when the last question is sent or skipped. Return a promise to hold the Send button in its loading state. */
  onSubmit?: (answers: ApprovalAnswers) => void | Promise<unknown>;
  /** Shows the close button and runs when it is pressed. */
  onDismiss?: () => void;
  /** After sending, the card becomes a small "Answers sent" pill with Start over. Defaults to true. */
  showResult?: boolean;
  /** Single choice questions move to the next one as soon as an option is picked. Defaults to true. */
  autoAdvance?: boolean;
  continueLabel?: string;
  submitLabel?: string;
  skipLabel?: string;
  sentLabel?: string;
  resetLabel?: string;
  className?: string;
}

const empty = { values: [] as string[], other: "" };
const answered = (answer: ApprovalAnswer | undefined) => !!answer && (answer.values.length > 0 || answer.other.trim() !== "");
const settle = { duration: duration.quick, ease: easeEnter };

/**
 * Human-in-the-loop questions an agent asks before it acts. One question shows at a time with its options, a free text
 * row, Skip and Continue; a stepper moves back through earlier answers. The card eases to each question's height, and
 * after the last one it folds into an "Answers sent" pill.
 */
export function ApprovalCard({ questions, onSubmit, onDismiss, showResult = true, autoAdvance = true, continueLabel = "Continue", submitLabel = "Send", skipLabel = "Skip", sentLabel = "Answers sent", resetLabel = "Start over", className }: ApprovalCardProps) {
  const reduce = useReducedMotion();
  const id = React.useId();
  const [step, setStep] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [answers, setAnswers] = React.useState<ApprovalAnswers>({});
  const [reached, setReached] = React.useState(0);
  const [status, setStatus] = React.useState<"asking" | "sending" | "sent">("asking");
  const advanceTimer = React.useRef<number | undefined>(undefined);
  const cardRef = React.useRef<HTMLElement>(null);
  const refocus = React.useRef(false);
  React.useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  // The leaving question stays mounted while it fades, so look the list up by the current question's id.
  const list = () => cardRef.current?.querySelector<HTMLElement>(`[data-list="${CSS.escape(questions[step]?.id ?? "")}"]`);
  React.useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    const first = list()?.querySelector<HTMLElement>("[data-option]:checked") ?? list()?.querySelector<HTMLElement>("[data-option]");
    first?.focus({ preventScroll: true });
  }, [step]);

  const total = questions.length;
  const current = questions[step];
  const answer = current ? answers[current.id] ?? empty : empty;
  const multiple = current?.type === "multiple";
  const last = step === total - 1;
  const ready = answered(answers[current?.id ?? ""]);

  function go(next: number) {
    window.clearTimeout(advanceTimer.current);
    if (next < 0 || next >= total) return;
    // Keep keyboard users in the card: the control they pressed may be disabled on the next question.
    refocus.current = !!cardRef.current?.contains(document.activeElement) || document.activeElement === document.body;
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setReached(value => Math.max(value, next));
  }

  async function finish(final: ApprovalAnswers) {
    setStatus("sending");
    try {
      await onSubmit?.(final);
      setStatus(showResult ? "sent" : "asking");
    } catch {
      setStatus("asking");
    }
  }

  function record(next: ApprovalAnswer) {
    const all = { ...answers, [current.id]: next };
    setAnswers(all);
    return all;
  }

  function pick(value: string) {
    if (!multiple) {
      record({ values: [value], other: "" });
      if (autoAdvance && !last) {
        window.clearTimeout(advanceTimer.current);
        // A short beat lets the radio fill before the next question slides in.
        advanceTimer.current = window.setTimeout(() => go(step + 1), reduce ? 0 : 220);
      }
      return;
    }
    const values = answer.values.includes(value) ? answer.values.filter(item => item !== value) : [...answer.values, value];
    record({ values, other: answer.other });
  }

  function type(text: string) {
    // In single choice, writing your own answer replaces the picked option.
    record({ values: multiple ? answer.values : [], other: text });
  }

  function proceed() {
    if (!ready) return;
    if (last) void finish(answers); else go(step + 1);
  }

  function skip() {
    const all = record(null);
    if (last) void finish(all); else go(step + 1);
  }

  function reset() {
    setAnswers({});
    setStep(0);
    setReached(0);
    setDirection(-1);
    setStatus("asking");
  }

  /** Arrows move between options; number keys pick one directly. */
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const inText = target.tagName === "INPUT" && (target as HTMLInputElement).type === "text";
    const rows = [...(list()?.querySelectorAll<HTMLElement>("[data-option], input[type='text']") ?? [])];
    const index = rows.indexOf(target);
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && index >= 0) {
      event.preventDefault();
      rows[(index + (event.key === "ArrowDown" ? 1 : -1) + rows.length) % rows.length]?.focus();
      return;
    }
    if (!inText && /^[1-9]$/.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const option = current?.options[Number(event.key) - 1];
      if (option) { event.preventDefault(); pick(option.value); }
    }
  }

  const content = { initial: reduce ? { opacity: 0 } : { opacity: 0, y: 8 * direction, filter: `blur(${blur.soft}px)` }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, exit: reduce ? { opacity: 0, transition: { duration: duration.instant } } : { opacity: 0, y: -6 * direction, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.fast, ease: easeStandard } } };

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {status === "sent" ? (
        <motion.div key="sent" className={cn("inline-flex items-center gap-3", className)} role="status" initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, filter: `blur(${blur.soft}px)` }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={reduce ? { duration: duration.instant } : { ...spring.snappy, opacity: settle, filter: settle }}>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-success/12 pr-3 pl-1 text-sm font-medium text-success">
            <motion.span className="grid size-5 place-items-center rounded-full bg-success text-background" initial={reduce ? false : iconIn} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ ...iconEnter, delay: reduce ? 0 : 0.06 }}>
              <Check className="size-3" strokeWidth={3} aria-hidden="true" />
            </motion.span>
            {sentLabel}
          </span>
          <button type="button" className="rounded-[var(--radius-sm)] text-sm text-muted-foreground transition-colors duration-[var(--duration-quick)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={reset}>{resetLabel}</button>
        </motion.div>
      ) : current ? (
        <motion.section ref={cardRef} key="card" aria-labelledby={`${id}-q`} className={cn("w-full max-w-[22rem] rounded-[var(--radius-xl)] border border-border bg-surface text-foreground shadow-floating", className)} onKeyDown={onKeyDown} exit={reduce ? { opacity: 0, transition: { duration: duration.instant } } : { opacity: 0, scale: 0.96, filter: `blur(${blur.soft}px)`, transition: { duration: duration.fast, ease: easeStandard } }}>
          <HeightFrame reduce={reduce} morphKey={current.id}>
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div key={current.id} {...content} transition={reduce ? { duration: duration.instant } : { ...spring.smooth, opacity: settle, filter: settle }}>
                <div className="flex items-start gap-3 px-4 pt-4 pb-2">
                  <h3 id={`${id}-q`} className="flex-1 text-[15px] leading-snug font-medium tracking-[-0.01em]">{current.question}</h3>
                  {onDismiss ? <button type="button" aria-label="Dismiss" className="-mt-0.5 -mr-1.5 grid size-7 flex-none place-items-center rounded-[var(--radius-sm)] text-muted-foreground transition-colors duration-[var(--duration-quick)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4" onClick={onDismiss}><X aria-hidden="true" /></button> : null}
                </div>
                <div data-list={current.id} role={multiple ? "group" : "radiogroup"} aria-labelledby={`${id}-q`} className="grid px-2 pb-2">
                  {current.options.map((option, index) => {
                    const on = answer.values.includes(option.value);
                    return (
                      <label key={option.value} className="group/opt flex h-8 cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] px-2 text-sm text-foreground/85 transition-colors duration-[var(--duration-quick)] hover:bg-muted has-[:checked]:text-foreground has-[:focus-visible]:bg-muted">
                        <input data-option="" type={multiple ? "checkbox" : "radio"} name={`${id}-${current.id}`} value={option.value} checked={on} onChange={() => pick(option.value)} aria-keyshortcuts={index < 9 ? String(index + 1) : undefined} className="peer sr-only" />
                        <Mark kind={multiple ? "checkbox" : "radio"} on={on} reduce={reduce} />
                        <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      </label>
                    );
                  })}
                  {current.allowOther !== false ? (
                    <input type="text" value={answer.other} placeholder={current.otherPlaceholder ?? "Something else…"} aria-label={`${current.question} Other answer`} onChange={event => type(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); proceed(); } }} className="h-8 w-full rounded-[var(--radius-md)] bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:bg-muted" />
                  ) : null}
                </div>
              </motion.div>
            </AnimatePresence>
          </HeightFrame>
          <div className="flex items-center gap-2 px-3 pt-6 pb-3">
            {total > 1 ? (
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
                <StepButton label="Previous question" disabled={step === 0} onClick={() => go(step - 1)}><ChevronUp aria-hidden="true" /></StepButton>
                <span aria-live="polite" aria-label={`Question ${step + 1} of ${total}`}>{step + 1}/{total}</span>
                <StepButton label="Next question" disabled={step >= reached} onClick={() => go(step + 1)}><ChevronDown aria-hidden="true" /></StepButton>
              </div>
            ) : null}
            <div className="ml-auto flex items-center gap-1.5">
              <Button size="sm" variant="secondary" className="h-7 rounded-full px-3" disabled={status === "sending"} onClick={skip}>{skipLabel}</Button>
              <Button size="sm" className="h-7 rounded-full px-3" disabled={!ready} loading={status === "sending"} onClick={proceed}>{last ? submitLabel : continueLabel}</Button>
            </div>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}

function StepButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="grid size-6 place-items-center rounded-[var(--radius-sm)] transition-colors duration-[var(--duration-quick)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5">{children}</button>;
}

/** The radio fills with a dot and the checkbox draws its check; both spring in and fade out quickly. */
function Mark({ kind, on, reduce }: { kind: "radio" | "checkbox"; on: boolean; reduce: boolean | null }) {
  const off = { duration: duration.instant };
  return (
    <span aria-hidden="true" className={cn("relative grid size-4 flex-none place-items-center border transition-colors duration-[var(--duration-quick)] peer-focus-visible:ring-2 peer-focus-visible:ring-ring", kind === "radio" ? "rounded-full" : "rounded-[4px]", on ? "border-primary bg-primary text-primary-foreground" : "border-border-strong group-hover/opt:border-muted-foreground")}>
      {kind === "radio" ? (
        <motion.span className="size-1.5 rounded-full bg-current" initial={false} animate={{ scale: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={reduce ? off : on ? spring.snappy : off} />
      ) : (
        <svg className="size-3" viewBox="0 0 12 12" fill="none">
          <motion.path d="M2.5 6.25 L5 8.5 L9.5 3.5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={reduce ? off : on ? spring.snappy : off} />
        </svg>
      )}
    </span>
  );
}

export default ApprovalCard;
