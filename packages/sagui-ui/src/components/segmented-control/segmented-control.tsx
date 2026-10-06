import * as React from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";

export interface Segment {
  value: string;
  label: string;
  /** Optional content after the label, such as a badge. */
  accessory?: React.ReactNode;
}

export interface SegmentedControlProps {
  options: Segment[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name of the group. */
  label?: string;
  /** Called when the pointer or focus reaches an option, before it is chosen. Use it to start loading what that option shows. */
  onOptionIntent?: (value: string) => void;
  className?: string;
}

/** Switch between a small set of related views. One highlight glides between options; arrow keys move the selection like a tab list. */
export function SegmentedControl({ options, value: valueProp, defaultValue, onValueChange, label, onOptionIntent, className }: SegmentedControlProps) {
  const id = React.useId();
  const reduced = useReducedMotion();
  const track = React.useRef<HTMLDivElement>(null);
  const [internal, setInternal] = React.useState(defaultValue ?? options[0]?.value ?? "");
  const value = valueProp ?? internal;
  const change = (next: string) => {
    if (valueProp === undefined) setInternal(next);
    onValueChange?.(next);
  };

  // When the options are wider than the container, the track scrolls inside itself. Edges fade only on the side with more to see.
  React.useLayoutEffect(() => {
    const node = track.current;
    if (!node) return;
    const edges = () => {
      const rest = node.scrollWidth - node.clientWidth - node.scrollLeft;
      node.toggleAttribute("data-fade-start", node.scrollLeft > 1);
      node.toggleAttribute("data-fade-end", rest > 1);
    };
    edges();
    node.addEventListener("scroll", edges, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(edges);
    observer?.observe(node);
    return () => { node.removeEventListener("scroll", edges); observer?.disconnect(); };
  }, [options.length]);

  // The selected option is always scrolled fully into view, with a little room so it clears the fade.
  const first = React.useRef(true);
  React.useEffect(() => {
    const node = track.current;
    const button = node?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!node || !button || node.scrollWidth <= node.clientWidth) { first.current = false; return; }
    const room = 20;
    const start = button.offsetLeft - room;
    const end = button.offsetLeft + button.offsetWidth + room - node.clientWidth;
    const left = node.scrollLeft > start ? start : node.scrollLeft < end ? end : node.scrollLeft;
    if (left !== node.scrollLeft) node.scrollTo({ left: Math.max(0, left), behavior: first.current || reduced ? "auto" : "smooth" });
    first.current = false;
  }, [value, reduced]);

  // Arrow keys, Home and End move the selection like a tab list; only the selected option is a tab stop.
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    const target = event.key === "ArrowRight" || event.key === "ArrowDown" ? (selectedIndex === last ? 0 : selectedIndex + 1)
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (selectedIndex === 0 ? last : selectedIndex - 1)
        : event.key === "Home" ? 0 : event.key === "End" ? last : -1;
    if (target < 0 || !options[target]) return;
    event.preventDefault();
    change(options[target].value);
    track.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(options[target].value)}"]`)?.focus({ preventScroll: true });
  };

  return (
    // The frame can shrink below its content inside flex and grid parents; the track then scrolls inside it.
    <div className={cn("inline-flex min-w-0 max-w-full shrink rounded-[var(--radius-lg)] border border-border bg-muted", className)} role="group" aria-label={label}>
      <LayoutGroup id={id}>
        {/* The track owns the stacking context so the gliding highlight passes under every label, not over earlier ones. */}
        <motion.div
          ref={track}
          layoutScroll
          className={cn(
            "isolate flex min-w-0 gap-0.5 overflow-x-auto overscroll-x-contain rounded-[inherit] p-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "[--fade-start:0px] [--fade-end:0px] data-[fade-start]:[--fade-start:20px] data-[fade-end]:[--fade-end:20px]",
            "[-webkit-mask-image:linear-gradient(to_right,transparent,#000_var(--fade-start),#000_calc(100%-var(--fade-end)),transparent)] [mask-image:linear-gradient(to_right,transparent,#000_var(--fade-start),#000_calc(100%-var(--fade-end)),transparent)]"
          )}
        >
          {options.map((option, index) => (
            // Items never scale or change weight; only the highlight travels and the label color follows it.
            <button
              key={option.value}
              id={`${id}-${option.value}`}
              className="relative min-h-8 flex-none cursor-pointer rounded-[var(--radius-md)] border-0 bg-transparent px-3 text-sm font-medium whitespace-nowrap text-muted-foreground [font-family:inherit] [-webkit-tap-highlight-color:transparent] transition-colors duration-[var(--duration-quick)] active:text-foreground aria-pressed:text-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-[380px]:px-2.5 motion-reduce:transition-none"
              type="button"
              data-value={option.value}
              aria-pressed={value === option.value}
              tabIndex={index === selectedIndex ? 0 : -1}
              onClick={() => change(option.value)}
              onKeyDown={onKeyDown}
              onPointerEnter={onOptionIntent ? () => onOptionIntent(option.value) : undefined}
              onFocus={onOptionIntent ? () => onOptionIntent(option.value) : undefined}
            >
              {value === option.value && (
                <motion.span
                  className="absolute inset-0 -z-1 rounded-[inherit] border border-border bg-surface shadow-resting"
                  layoutId="selection"
                  layoutDependency={value}
                  transition={reduced ? { duration: 0 } : spring.morph}
                  aria-hidden="true"
                />
              )}
              <span className="relative z-1 inline-flex items-center gap-1.5">{option.label}{option.accessory}</span>
            </button>
          ))}
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
