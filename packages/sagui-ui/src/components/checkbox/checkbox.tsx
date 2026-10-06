import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeStandard } from "../../lib/motion";

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Visible label. Without one, pass `aria-label`. */
  label?: string;
  /** Helper copy under the label, linked with aria-describedby. */
  description?: string;
}

/** Both marks share three points, so the check morphs into the dash and back instead of swapping. */
const checkPath = "M4.25 9.25 L7.25 12.25 L13.75 5.75";
const dashPath = "M4.75 9 L9 9 L13.25 9";

/** A binary choice with a third, indeterminate state. The check draws itself and morphs into the dash. */
export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(function Checkbox(
  { label, description, id, className, checked, defaultChecked, onCheckedChange, ...props }, ref
) {
  const generatedId = React.useId();
  const controlId = id ?? generatedId;
  const reduced = useReducedMotion();
  const [internal, setInternal] = React.useState<CheckboxPrimitive.CheckedState>(defaultChecked ?? false);
  const state = checked ?? internal;
  const on = state !== false;
  const change = (next: CheckboxPrimitive.CheckedState) => {
    if (checked === undefined) setInternal(next);
    onCheckedChange?.(next);
  };
  const fade: Transition = { duration: on ? duration.instant : duration.quick, ease: easeStandard };
  return (
    <div className="inline-flex min-w-0 items-start">
      <CheckboxPrimitive.Root
        {...props}
        id={controlId}
        ref={ref}
        checked={state}
        onCheckedChange={change}
        className={cn("group/cb relative grid size-10 flex-none cursor-pointer place-items-center rounded-[var(--radius-md)] border-0 bg-transparent p-0 text-primary-foreground [-webkit-tap-highlight-color:transparent] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50", className)}
        aria-describedby={description ? `${controlId}-description` : undefined}
        aria-label={props["aria-label"] ?? (label ? undefined : "Checkbox")}
      >
        {/* The square is the only part that reacts to a press, so the hit area and label never move. */}
        <span
          className={cn(
            "relative block size-[18px] rounded-[5px] border border-border-strong bg-surface",
            "[transition:border-color_var(--duration-quick)_var(--ease-out-quint),transform_var(--duration-spring)_var(--ease-spring)]",
            "group-data-[state=checked]/cb:border-primary group-data-[state=indeterminate]/cb:border-primary",
            "[@media(hover:hover)_and_(pointer:fine)]:group-hover/cb:group-enabled/cb:group-data-[state=unchecked]/cb:border-muted-foreground",
            "group-active/cb:group-enabled/cb:scale-95 group-active/cb:group-enabled/cb:[transition-duration:var(--duration-quick),var(--duration-instant)]",
            "group-focus-visible/cb:ring-2 group-focus-visible/cb:ring-ring group-focus-visible/cb:ring-offset-2 group-focus-visible/cb:ring-offset-background",
            "motion-reduce:transition-none motion-reduce:group-active/cb:scale-100"
          )}
          aria-hidden="true"
        >
          <motion.span className="absolute -inset-px rounded-[inherit] bg-primary" initial={false} animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.6 }} transition={reduced ? { duration: 0 } : ({ scale: spring.snappy, opacity: fade } as Transition)} />
          <svg className="absolute -inset-px size-[18px] overflow-visible" viewBox="0 0 18 18" fill="none" focusable="false">
            <motion.path
              initial={false}
              animate={{ d: state === "indeterminate" ? dashPath : checkPath, pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
              transition={reduced ? { duration: 0 } : ({ d: spring.morph, pathLength: spring.snappy, opacity: fade } as Transition)}
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </CheckboxPrimitive.Root>
      {label || description ? (
        // The label's first line centers on the square: (40px box - 19.6px line) / 2.
        <div className="ml-px grid min-w-0 gap-0.5 pt-[10.2px]">
          {label ? <label htmlFor={controlId} className="cursor-pointer text-sm font-medium leading-snug text-foreground">{label}</label> : null}
          {description ? <span id={`${controlId}-description`} className="text-xs leading-snug text-muted-foreground">{description}</span> : null}
        </div>
      ) : null}
    </div>
  );
});
Checkbox.displayName = "Checkbox";
