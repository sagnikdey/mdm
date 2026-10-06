import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, X } from "lucide-react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { adornmentButton, bareInput, fieldLabel, fieldShell } from "../../lib/field";
import { easeStandard } from "../../lib/motion";

export interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  /** Visible label and accessible name. */
  label: string;
  value: string;
  onValueChange: (value: string) => void;
}

/** A search entry point. The glass wakes up with the field, and the clear button has a reserved slot so the field never changes width. */
export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField({ label, value, onValueChange, id, className, ...props }, ref) {
  const generated = React.useId();
  const controlId = id ?? generated;
  const reduced = useReducedMotion();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };
  // Clearing returns focus to the field, since the clear button unmounts under the pointer.
  function clear() {
    onValueChange("");
    inputRef.current?.focus();
  }
  return (
    <div className="grid min-w-0 gap-2">
      <label className={cn(fieldLabel, "mb-0")} htmlFor={controlId}>{label}</label>
      <div className={cn(fieldShell(), "group/search gap-2 px-3")} data-filled={value ? "true" : undefined}>
        <Search className="flex-none text-muted-foreground transition-colors duration-[var(--duration-quick)] group-focus-within/search:text-foreground group-data-[filled]/search:text-foreground" width={18} height={18} aria-hidden="true" />
        <input {...props} ref={setRefs} id={controlId} type="search" value={value} onChange={(event) => onValueChange(event.target.value)} className={cn(bareInput, "[&::-webkit-search-cancel-button]:hidden", className)} />
        <span className="grid size-6 flex-none place-items-center">
          <AnimatePresence initial={false}>
            {value ? (
              <motion.button
                key="clear"
                type="button"
                className={cn(adornmentButton, "size-6 active:scale-100")}
                onClick={clear}
                aria-label="Clear search"
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8, filter: `blur(${blur.subtle}px)` }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.8, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.instant, ease: easeStandard } }}
                whileTap={reduced ? undefined : { scale: 0.96, transition: { duration: duration.instant, ease: easeStandard } }}
                transition={reduced ? { duration: duration.instant } : { ...spring.snappy, opacity: { duration: duration.fast }, filter: { duration: duration.fast } }}
              >
                <X width={16} height={16} aria-hidden="true" />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </span>
      </div>
    </div>
  );
});
SearchField.displayName = "SearchField";
