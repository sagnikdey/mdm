import * as React from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { duration } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { fadeIn, fadeOut, iconEnter, iconIn, iconOut, rest } from "../../lib/motion";
import { menuContent, menuItem, menuItemDestructive } from "../../lib/menu";
import { MorphText, iconKey, useMorphWidth } from "../../lib/morph";

export interface SplitButtonAction {
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
  /** Colors the item as a destructive action. */
  destructive?: boolean;
  icon?: React.ReactNode;
}

export interface SplitButtonProps {
  /** Label of the main action. Changing it morphs in place, so "Copy page" can answer "Copied". */
  label: string;
  /** Alternatives shown in the menu behind the chevron. */
  actions: SplitButtonAction[];
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

const half = [
  "border-0 text-[inherit] font-[inherit] cursor-pointer select-none",
  "transition-[background-color,color,opacity] duration-[var(--duration-quick)] ease-[var(--ease-out-quint)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
].join(" ");

const tone = {
  primary: {
    group: "border-primary bg-primary rounded-[var(--radius-md)]",
    half: "bg-primary text-primary-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:enabled:bg-[color-mix(in_oklab,var(--color-primary)_88%,var(--color-background))] active:enabled:bg-[color-mix(in_oklab,var(--color-primary)_80%,var(--color-background))]",
    main: "h-10 px-4 text-sm rounded-l-[calc(var(--radius-md)-1px)]",
    trigger: "h-10 w-[38px] rounded-r-[calc(var(--radius-md)-1px)] border-l border-l-[color-mix(in_oklab,var(--color-background)_18%,var(--color-primary))] data-[state=open]:bg-[color-mix(in_oklab,var(--color-primary)_80%,var(--color-background))]",
  },
  secondary: {
    group: "border-border bg-surface rounded-full",
    half: "bg-surface text-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:enabled:bg-muted active:enabled:bg-[color-mix(in_oklab,var(--color-muted),var(--color-border)_55%)]",
    main: "h-8 min-w-[142px] px-3 text-xs rounded-l-full",
    trigger: "h-8 w-8 rounded-r-full border-l border-l-border/60 data-[state=open]:bg-[color-mix(in_oklab,var(--color-muted),var(--color-border)_55%)]",
  },
} as const;

/** The main action morphs its icon and label in place while its width follows on a spring; the menu half never scales, so the menu opens from a still anchor. */
export function SplitButton({ label, actions, onClick, disabled, icon, variant = "primary", className }: SplitButtonProps) {
  const reduced = useReducedMotion() ?? false;
  const contentRef = React.useRef<HTMLSpanElement>(null);
  const glyph = iconKey(icon);
  const width = useMorphWidth(contentRef, `${glyph}|${label}`, reduced);
  const t = tone[variant];
  return (
    <DropdownPrimitive.Root>
      <div
        className={cn(
          "inline-flex items-stretch border [transition:transform_var(--duration-spring)_var(--ease-spring)]",
          "has-[>_[data-main]:active:not(:disabled)]:scale-[.97] has-[>_[data-main]:active:not(:disabled)]:[transition-duration:var(--duration-instant)]",
          "motion-reduce:transition-none motion-reduce:has-[>_[data-main]:active:not(:disabled)]:scale-100",
          t.group,
          className
        )}
      >
        <button data-main="" className={cn(half, t.half, t.main, "relative inline-grid place-items-center")} type="button" onClick={onClick} disabled={disabled}>
          {/* The slot springs to the width of the next label and clips only while it morphs. */}
          <motion.span className="inline-flex min-w-0 items-center data-[morphing]:[clip-path:inset(-50%_-.5rem)]" style={{ width }} aria-hidden="true">
            <span ref={contentRef} className="inline-flex flex-none items-center gap-2 whitespace-nowrap">
              {icon ? (
                <span className="inline-grid flex-none place-items-center [&_svg]:size-4">
                  <AnimatePresence initial={false}>
                    <motion.span
                      key={glyph}
                      className="col-start-1 row-start-1 inline-flex items-center justify-center"
                      initial={reduced ? fadeIn : iconIn}
                      animate={rest}
                      exit={reduced ? fadeOut : iconOut}
                      transition={reduced ? { duration: duration.instant } : iconEnter}
                    >
                      {icon}
                    </motion.span>
                  </AnimatePresence>
                </span>
              ) : null}
              <MorphText text={label} reduced={reduced} />
            </span>
          </motion.span>
          <span className="sr-only" aria-live="polite">{label}</span>
        </button>
        <DropdownPrimitive.Trigger className={cn(half, t.half, t.trigger, "grid place-items-center")} type="button" aria-label={`${label} more actions`} disabled={disabled}>
          <ChevronDown className="size-4 [transition:transform_var(--duration-spring)_var(--ease-spring)] in-data-[state=open]:rotate-180 motion-reduce:transition-none" strokeWidth={1.75} aria-hidden="true" />
        </DropdownPrimitive.Trigger>
      </div>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content className={menuContent} sideOffset={4} align="end" collisionPadding={12} loop>
          {actions.map((action, index) => (
            <DropdownPrimitive.Item
              key={action.label}
              className={cn(menuItem, action.destructive && menuItemDestructive)}
              style={{ "--i": index } as React.CSSProperties}
              disabled={action.disabled}
              onSelect={action.onSelect}
            >
              {action.icon ? <span className="inline-flex [&_svg]:size-4" aria-hidden="true">{action.icon}</span> : null}
              {action.label}
            </DropdownPrimitive.Item>
          ))}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}
