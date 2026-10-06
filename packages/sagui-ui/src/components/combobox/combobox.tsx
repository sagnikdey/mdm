import * as React from "react";
import { animate, AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { FieldMessage, adornmentButton, describedBy, fieldLabel, fieldShell } from "../../lib/field";
import { easeEnter, easeStandard } from "../../lib/motion";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Extra words that should also find this option. */
  keywords?: string[];
}

export interface ComboboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "placeholder"> {
  /** Visible label and accessible name. */
  label: string;
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  description?: string;
  /** Error copy. Colors the border and is announced as an alert. */
  error?: string;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

/** Follows the listbox height with a critically damped spring, so filtering never snaps the menu. */
function AutoHeight({ children, reduceMotion }: { children: React.ReactNode; reduceMotion: boolean | null }) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | "auto">("auto");
  React.useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const observer = new ResizeObserver(() => setHeight(inner.offsetHeight));
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);
  return (
    <motion.div className="overflow-hidden" initial={false} animate={{ height }} transition={reduceMotion ? { duration: 0 } : spring.smooth}>
      <div ref={innerRef}>{children}</div>
    </motion.div>
  );
}

/** Search and select from a list without leaving the field. Typing filters; arrow keys move; Enter chooses; the chosen label settles into the field. */
export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  { label, options, value: controlledValue, defaultValue = "", onValueChange, description, error, placeholder = "Search or select…", emptyMessage = "No matches found", id, className, disabled, onFocus, ...inputProps },
  forwardedRef
) {
  const generatedId = React.useId();
  const controlId = id ?? generatedId;
  const listboxId = `${controlId}-listbox`;
  const hintId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const optionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const reduceMotion = useReducedMotion();
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const selectedValue = controlledValue ?? uncontrolledValue;
  const selectedOption = options.find((option) => option.value === selectedValue);

  React.useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  // A chosen label settles into the field: it rises in from below with a soft blur. Clearing fades the placeholder in instead of snapping.
  const settledValue = React.useRef(selectedValue);
  React.useEffect(() => {
    if (settledValue.current === selectedValue) return;
    settledValue.current = selectedValue;
    const input = inputRef.current;
    if (!input || reduceMotion || (selectedValue && open)) return;
    const controls = selectedValue
      ? animate(input, { opacity: [0, 1], y: ["0.35em", "0em"], filter: [`blur(${blur.soft}px)`, "blur(0px)"] }, { duration: duration.standard, ease: easeEnter })
      : animate(input, { opacity: [0, 1] }, { duration: duration.quick, ease: easeEnter });
    return () => controls.complete();
  }, [selectedValue, reduceMotion, open]);

  const filteredOptions = React.useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return options;
    return options.filter((option) => [option.label, ...(option.keywords ?? [])].some((term) => term.toLocaleLowerCase().includes(normalized)));
  }, [options, query]);

  const enabledIndices = filteredOptions.reduce<number[]>((indices, option, index) => {
    if (!option.disabled) indices.push(index);
    return indices;
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const activeOption = activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;
    const option = activeOption ? optionRefs.current[activeOption.value] : null;
    const listbox = option?.parentElement;
    if (option && listbox) {
      const top = option.offsetTop;
      const bottom = top + option.offsetHeight;
      if (top < listbox.scrollTop) listbox.scrollTop = top;
      else if (bottom > listbox.scrollTop + listbox.clientHeight) listbox.scrollTop = bottom - listbox.clientHeight;
    }
  }, [activeIndex, filteredOptions, open]);

  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) { setOpen(false); setQuery(""); }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const choose = (option: ComboboxOption) => {
    if (option.disabled) return;
    setUncontrolledValue(option.value);
    onValueChange?.(option.value);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const clear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setUncontrolledValue("");
    onValueChange?.("");
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  };

  const openMenu = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) { openMenu(); return; }
      if (!enabledIndices.length) return;
      const currentPosition = enabledIndices.indexOf(activeIndex);
      const nextPosition = event.key === "ArrowDown" ? (currentPosition + 1) % enabledIndices.length : (currentPosition - 1 + enabledIndices.length) % enabledIndices.length;
      setActiveIndex(enabledIndices[nextPosition]);
      return;
    }
    if (event.key === "Enter" && open && activeIndex >= 0) {
      event.preventDefault();
      const option = filteredOptions[activeIndex];
      if (option) choose(option);
      return;
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      setQuery("");
    }
  };

  const inputValue = open ? query : selectedOption?.label ?? "";
  const activeOption = activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;

  return (
    <div ref={rootRef} className="relative grid min-w-0">
      <label htmlFor={controlId} className={fieldLabel}>{label}</label>
      <div
        className={cn(
          fieldShell(!!error),
          "relative z-2 gap-2 px-3",
          open && "border-border-strong bg-muted",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <Search className="flex-none text-muted-foreground" size={16} strokeWidth={1.75} aria-hidden="true" />
        <input
          {...inputProps}
          ref={inputRef}
          id={controlId}
          type="text"
          role="combobox"
          className="w-full min-w-0 border-0 bg-transparent p-0 font-[inherit] text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          value={inputValue}
          // While searching, the chosen label stays in place as muted placeholder copy instead of vanishing.
          placeholder={selectedOption?.label ?? placeholder}
          disabled={disabled}
          aria-describedby={describedBy(hintId, errorId)}
          aria-invalid={error ? true : undefined}
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={open && activeOption ? `${controlId}-option-${activeOption.value}` : undefined}
          onFocus={(event) => { onFocus?.(event); openMenu(); }}
          onClick={openMenu}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); setActiveIndex(-1); }}
          onKeyDown={handleKeyDown}
        />
        <AnimatePresence initial={false}>
          {selectedOption && !disabled && (
            <motion.button
              type="button"
              className={cn(adornmentButton, "size-[22px] rounded-full active:scale-100")}
              aria-label="Clear selection"
              onMouseDown={(event) => event.preventDefault()}
              onClick={clear}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: `blur(${blur.subtle}px)` }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: reduceMotion ? { duration: duration.instant } : ({ ...spring.snappy, opacity: { duration: duration.fast } } as never) }}
              exit={{ opacity: 0, ...(reduceMotion ? {} : { scale: 0.6, filter: `blur(${blur.subtle}px)` }), transition: { duration: duration.instant, ease: easeStandard } }}
              whileTap={{ scale: reduceMotion ? 1 : 0.96, transition: { duration: duration.instant, ease: easeStandard } }}
            >
              <X size={16} strokeWidth={1.75} aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>
        <ChevronDown className={cn("flex-none text-muted-foreground [transition:transform_var(--duration-spring)_var(--ease-spring)] motion-reduce:transition-none", open && "rotate-180")} size={16} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <FieldMessage id={hintId} text={description} rollNumbers={false} />
      <FieldMessage id={errorId} text={error} tone="error" rollNumbers={false} />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="absolute inset-x-0 top-[calc(100%+8px)] z-80 origin-top overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface p-[5px] text-foreground shadow-floating will-change-[transform,opacity]"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: reduceMotion ? { duration: duration.instant } : ({ ...spring.snappy, opacity: { duration: duration.fast, ease: easeEnter } } as never) }}
            exit={{ opacity: 0, ...(reduceMotion ? {} : { y: -4, scale: 0.98 }), transition: { duration: duration.instant, ease: easeStandard } }}
            role="presentation"
          >
            <AutoHeight reduceMotion={reduceMotion}>
              <div id={listboxId} className="max-h-[min(300px,40vh)] overflow-y-auto overscroll-contain" role="listbox" aria-label={`${label} options`}>
                {filteredOptions.length ? (
                  filteredOptions.map((option, index) => (
                    <div
                      key={option.value}
                      ref={(element) => { optionRefs.current[option.value] = element; }}
                      id={`${controlId}-option-${option.value}`}
                      // Arrow keys move the highlight often, so it changes almost instantly.
                      className="flex min-h-9 cursor-pointer select-none items-center justify-between gap-3 rounded-[calc(var(--radius-xl)-5px)] px-3 text-sm text-foreground outline-none transition-colors duration-75 data-[active=true]:bg-muted data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-40 motion-reduce:transition-none"
                      data-active={index === activeIndex ? "true" : undefined}
                      data-disabled={option.disabled ? "true" : undefined}
                      role="option"
                      aria-selected={option.value === selectedValue}
                      aria-disabled={option.disabled || undefined}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                      onClick={() => choose(option)}
                    >
                      <span className="min-w-0 truncate">{option.label}</span>
                      {option.value === selectedValue && <Check className="flex-none text-foreground" size={16} strokeWidth={1.75} aria-hidden="true" />}
                    </div>
                  ))
                ) : (
                  <motion.div
                    className="p-3 text-sm text-muted-foreground"
                    role="status"
                    initial={reduceMotion ? false : { opacity: 0, y: 4, filter: `blur(${blur.soft}px)` }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: duration.standard, ease: easeEnter }}
                  >
                    {emptyMessage}
                  </motion.div>
                )}
              </div>
            </AutoHeight>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
Combobox.displayName = "Combobox";
