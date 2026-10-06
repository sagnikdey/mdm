import * as React from "react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { blur, duration, ease, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { FieldMessage, describedBy, fieldLabel, focusRing } from "../../lib/field";
import { easeEnter, easeStandard } from "../../lib/motion";

export interface TagInputProps {
  /** Visible label and accessible name. */
  label: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  /** Helper copy under the field. */
  description?: string;
  /** Error copy. Colors the border and is announced as an alert. */
  error?: string;
  id?: string;
  className?: string;
}

/**
 * Tags keep the field still: a new tag blurs in where its text was typed while the caret glides aside, a removed tag
 * leaves its slot and the rest glide in, and the shell follows wrapped rows on a spring. Backspace or the arrow keys
 * pick a tag first, a ring glides to it, and the next Backspace removes it.
 */
export function TagInput({ label, value, defaultValue = [], onValueChange, placeholder = "Add a tag", description, error, id, className }: TagInputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const hintId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const [draft, setDraft] = React.useState("");
  const [picked, setPicked] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState("");
  const reduced = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const ringRef = React.useRef<HTMLSpanElement>(null);
  const ringAt = React.useRef("");
  // The shell follows its wrapped rows on a spring instead of jumping when a tag starts or leaves a line.
  const [height, setHeight] = React.useState<number | "auto">("auto");
  const tags = value ?? internal;
  const active = picked !== null && tags.includes(picked) ? picked : null;
  React.useEffect(() => {
    const node = contentRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  // The ring measures the picked tag's resting box, glides between picks, and fades in place when the pick clears.
  React.useLayoutEffect(() => {
    const ring = ringRef.current;
    const node = active === null ? null : contentRef.current?.querySelector<HTMLElement>(`[data-tag="${CSS.escape(active)}"]`);
    if (!ring) return;
    // It leaves on the same curve as a removed tag, so a picked tag and its ring fade out as one piece.
    if (!node) {
      if (ringAt.current) animate(ring, reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }, { duration: reduced ? 0 : duration.instant, ease: easeStandard });
      ringAt.current = "";
      return;
    }
    const box = { x: node.offsetLeft, y: node.offsetTop, width: node.offsetWidth, height: node.offsetHeight };
    const at = Object.values(box).join(" ");
    if (at === ringAt.current) return;
    // A ring that is still fading from the last pick glides on to the next one, so quick Backspaces read as one motion.
    if (!reduced && (ringAt.current || Number(getComputedStyle(ring).opacity) > 0.02)) {
      animate(ring, { ...box, opacity: 1, scale: 1 }, { ...spring.morph, opacity: { duration: duration.fast } });
    } else {
      animate(ring, { ...box, opacity: [0, 1], scale: [reduced ? 1 : 0.9, 1] }, reduced ? { duration: 0, opacity: { duration: duration.instant } } : { duration: 0, opacity: { duration: duration.fast }, scale: spring.snappy });
    }
    ringAt.current = at;
  });
  function say(message: string) {
    setNotice((previous) => (previous === message ? `${message} ` : message));
  }
  function update(next: string[]) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }
  function pick(tag: string | null) {
    setPicked(tag);
    if (tag !== null) say(`${tag} selected. Press Backspace to remove it.`);
  }
  function add() {
    const tag = draft.trim();
    if (!tag) return;
    const existing = tags.find((item) => item.toLowerCase() === tag.toLowerCase());
    // A duplicate pulses the tag that already exists, so the ignored Enter still gets an answer.
    if (existing) {
      const node = scope.current?.querySelector(`[data-tag="${CSS.escape(existing)}"]`);
      if (node && !reduced) animate(node, { scale: [1, 1.06, 1] }, { duration: duration.standard + duration.instant, ease: [...ease.inOut] as [number, number, number, number] });
      say(`${existing} is already added`);
      return;
    }
    update([...tags, tag]);
    setDraft("");
    setPicked(null);
    say(`Added ${tag}`);
  }
  function remove(tag: string) {
    update(tags.filter((item) => item !== tag));
    setPicked(null);
    say(`Removed ${tag}`);
    inputRef.current?.focus();
  }
  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const { key, currentTarget: input } = event;
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
    const index = active === null ? tags.length : tags.indexOf(active);
    let handled = true;
    if (key === "Enter" || key === ",") add();
    else if ((key === "Backspace" || key === "Delete") && active !== null) remove(active);
    else if (key === "Backspace" && atStart && tags.length) pick(tags[tags.length - 1]);
    else if (key === "ArrowLeft" && (atStart || active !== null) && index > 0) pick(tags[index - 1]);
    else if (key === "ArrowRight" && active !== null) pick(tags[index + 1] ?? null);
    else if (key === "Escape" && active !== null) pick(null);
    else handled = false;
    if (handled) event.preventDefault();
  }
  // A click on a tag picks it without taking focus from the field. The remove button keeps its own press.
  function onTagPointer(event: React.MouseEvent<HTMLElement>, tag?: string) {
    if ((event.target as HTMLElement).closest("button")) return;
    if (!tag) {
      event.preventDefault();
      return;
    }
    pick(active === tag ? null : tag);
    inputRef.current?.focus();
  }
  const move = reduced ? { duration: 0 } : spring.morph;
  const glide = reduced ? { duration: 0 } : spring.smooth;
  return (
    <div className={cn("grid w-full min-w-0", className)}>
      <label className={fieldLabel} htmlFor={inputId}>{label}</label>
      {/* The shell animates its height to the content, which carries the wrapping rows. */}
      <motion.div
        ref={scope}
        className={cn(
          "box-content overflow-hidden rounded-[var(--radius-md)] border bg-surface transition-[border-color,box-shadow] duration-[var(--duration-quick)] motion-reduce:transition-none",
          focusRing,
          error
            ? "border-destructive focus-within:border-destructive focus-within:ring-destructive/25"
            : "border-border [@media(hover:hover)_and_(pointer:fine)]:hover:not-focus-within:border-border-strong"
        )}
        initial={false}
        animate={{ height }}
        transition={glide}
      >
        {/* Equal 7px padding makes one row fill the minimum height exactly, so existing tags hold their line when a second row opens. */}
        <div ref={contentRef} className="relative box-border flex min-h-[calc(2.5rem-2px)] cursor-text flex-wrap content-start items-center gap-1.5 p-[7px]" onClick={(event) => { if (event.target === event.currentTarget) inputRef.current?.focus(); }}>
          {/* The pick ring rides above the pills and sizes itself to the picked tag, so it can glide between tags without scaling its border. */}
          <span ref={ringRef} className="pointer-events-none absolute top-0 left-0 z-1 box-border rounded-full border border-primary bg-primary/10 opacity-0" aria-hidden="true" />
          {/* The visible placeholder is drawn here so it can rise in when the last tag leaves. The native one stays for assistive tech. */}
          <AnimatePresence initial={false}>
            {!draft && !tags.length && (
              <motion.span
                key="placeholder"
                className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-3 text-sm whitespace-nowrap text-muted-foreground"
                aria-hidden="true"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.3em", filter: `blur(${blur.soft}px)` }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0 } }}
                transition={reduced ? { duration: duration.instant } : { duration: duration.standard, ease: easeEnter }}
              >
                {placeholder}
              </motion.span>
            )}
          </AnimatePresence>
          <AnimatePresence initial={false} mode="popLayout">
            {tags.map((tag) => (
              <motion.span
                layout={reduced ? false : "position"}
                className="group/tag relative box-border inline-flex min-h-7 cursor-default items-center gap-[3px] rounded-full border border-border bg-muted pr-1 pl-[9px] text-sm whitespace-nowrap text-foreground"
                key={tag}
                data-tag={tag}
                data-picked={tag === active || undefined}
                onMouseDown={(event) => onTagPointer(event)}
                onClick={(event) => onTagPointer(event, tag)}
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: `blur(${blur.soft}px)` }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.9, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.instant, ease: easeStandard } }}
                transition={reduced ? { duration: duration.instant } : ({ ...spring.morph, layout: move, opacity: { duration: duration.fast, ease: easeEnter }, filter: { duration: duration.standard, ease: easeEnter } } as never)}
              >
                {/* A resting tag is not a stacking context (its filter ends at none), so its label and button sit above the ring while its fill stays below. */}
                <span className="relative z-2">{tag}</span>
                <button
                  type="button"
                  className={cn(
                    "relative z-2 grid size-[22px] cursor-pointer place-items-center rounded-full border-0 bg-transparent text-muted-foreground group-data-[picked]/tag:text-foreground",
                    "[transition:background-color_var(--duration-quick)_var(--ease-out-quint),color_var(--duration-quick)_var(--ease-out-quint),transform_var(--duration-spring)_var(--ease-spring)]",
                    "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground",
                    "active:scale-[.96] active:[transition-duration:var(--duration-quick),var(--duration-quick),var(--duration-instant)]",
                    "focus-visible:bg-surface focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "motion-reduce:transition-none motion-reduce:active:scale-100"
                  )}
                  onClick={() => remove(tag)}
                  aria-label={`Remove ${tag}`}
                >
                  <X width={14} height={14} aria-hidden="true" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
          <motion.input
            layout={reduced ? false : "position"}
            transition={{ layout: move }}
            ref={inputRef}
            id={inputId}
            className="box-border min-h-7 min-w-20 flex-[1_1_100px] border-0 bg-transparent px-[5px] font-[inherit] text-sm text-foreground outline-none placeholder:text-transparent"
            value={draft}
            onChange={(event) => { setDraft(event.currentTarget.value); setPicked(null); }}
            onKeyDown={onKeyDown}
            onBlur={() => { add(); setPicked(null); }}
            placeholder={tags.length ? "" : placeholder}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(hintId, errorId)}
          />
        </div>
      </motion.div>
      <span className="sr-only" aria-live="polite">{notice}</span>
      <FieldMessage id={hintId} text={description} rollNumbers={false} />
      <FieldMessage id={errorId} text={error} tone="error" rollNumbers={false} />
    </div>
  );
}
