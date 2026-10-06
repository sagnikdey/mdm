import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { blur, duration } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { FieldMessage, describedBy, fieldLabel } from "../../lib/field";
import { easeEnter, easeStandard } from "../../lib/motion";
import { selectContent } from "../../lib/menu";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>, "children"> {
  /** Visible label and accessible name. */
  label: string;
  /** Helper copy under the field. */
  description?: string;
  /** Error copy. Colors the border and is announced as an alert. */
  error?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  options: SelectOption[];
}

/** The shown value rolls in the direction of the list: a later option rises from below, an earlier one drops from above. */
const valueRoll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * 0.35}em`, filter: `blur(${blur.soft}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.standard, ease: easeEnter } },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -0.3}em`, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.quick, ease: easeStandard } }),
};
/** Reduced motion keeps a short crossfade; the resting state matches valueRoll so server and client markup agree. */
const valueFade: Variants = { enter: { opacity: 0 }, center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.instant } }, exit: { opacity: 0, transition: { duration: duration.instant } } };

/** A compact choice field with a keyboard friendly menu. Built on Radix Select, so typeahead, focus and screen reader behavior are native. */
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(function Select(
  { label, description, error, placeholder = "Select an option", options, id, className, disabled, onValueChange, ...rootProps }, ref
) {
  const generatedId = React.useId();
  const controlId = id ?? generatedId;
  const hintId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const reduceMotion = useReducedMotion();
  const [uncontrolledValue, setUncontrolledValue] = React.useState(rootProps.defaultValue ?? "");
  const currentValue = rootProps.value ?? uncontrolledValue;
  const index = options.findIndex((option) => option.value === currentValue);
  const shown = currentValue ? options[index]?.label ?? "" : placeholder;
  const [previousIndex, setPreviousIndex] = React.useState(index);
  const [direction, setDirection] = React.useState(1);
  if (previousIndex !== index) { setPreviousIndex(index); setDirection(index > previousIndex ? 1 : -1); }

  return (
    <div className="grid min-w-0">
      <label htmlFor={controlId} className={fieldLabel}>{label}</label>
      <SelectPrimitive.Root {...rootProps} disabled={disabled} onValueChange={(next) => { setUncontrolledValue(next); onValueChange?.(next); }}>
        {/* The trigger anchors the floating menu. Radix opens on pointerdown and measures this box, so it never scales: press feedback is color only. */}
        <SelectPrimitive.Trigger
          ref={ref}
          id={controlId}
          aria-describedby={describedBy(hintId, errorId)}
          aria-invalid={error ? true : undefined}
          className={cn(
            "relative box-border flex min-h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-md)] border bg-surface px-3 text-left text-sm text-foreground",
            "transition-[border-color,background-color,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
            "[@media(hover:hover)_and_(pointer:fine)]:hover:not-data-[disabled]:bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:not-data-[disabled]:border-border-strong",
            "data-[state=open]:border-border-strong data-[state=open]:bg-muted",
            "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25",
            "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
            error ? "border-destructive focus-visible:ring-destructive/25" : "border-border",
            className
          )}
        >
          {/* Radix keeps the real value for assistive tech; the visible copy below animates between values. */}
          <span className="sr-only"><SelectPrimitive.Value placeholder={placeholder} /></span>
          <span className="grid min-w-0 flex-1 [grid-template-columns:minmax(0,1fr)]" aria-hidden="true">
            <AnimatePresence initial={false} custom={direction}>
              <motion.span
                key={currentValue ? `value-${currentValue}` : "placeholder"}
                className={cn("min-w-0 truncate [grid-area:1/1]", !currentValue && "text-muted-foreground")}
                custom={direction}
                variants={reduceMotion ? valueFade : valueRoll}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {shown}
              </motion.span>
            </AnimatePresence>
          </span>
          <SelectPrimitive.Icon className="inline-flex flex-none text-muted-foreground [transition:transform_var(--duration-spring)_var(--ease-spring)] in-data-[state=open]:rotate-180 motion-reduce:transition-none">
            <ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className={selectContent} position="popper" sideOffset={4} collisionPadding={12}>
            <SelectPrimitive.ScrollUpButton className="grid h-7 place-items-center text-muted-foreground"><ChevronUp size={16} strokeWidth={1.75} aria-hidden="true" /></SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className="py-0.5">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="relative flex min-h-9 cursor-default select-none items-center rounded-[calc(var(--radius-xl)-6px)] py-0 pr-[34px] pl-[11px] text-sm text-foreground outline-none transition-colors duration-[var(--duration-instant)] data-[disabled]:opacity-45 data-[highlighted]:bg-muted"
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-2.5 inline-flex items-center text-foreground [animation:sg-pop-in_var(--duration-standard)_var(--ease-enter)_40ms_both] motion-reduce:animate-none">
                    <Check size={16} strokeWidth={1.75} aria-hidden="true" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="grid h-7 place-items-center text-muted-foreground"><ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" /></SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      <FieldMessage id={hintId} text={description} rollNumbers={false} />
      <FieldMessage id={errorId} text={error} tone="error" rollNumbers={false} />
    </div>
  );
});
Select.displayName = "Select";
