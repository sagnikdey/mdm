import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";

export const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none overflow-hidden",
    "rounded-[var(--radius-md)] transition-colors duration-[var(--duration-base)] cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-busy:cursor-progress",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-border bg-transparent text-foreground hover:bg-muted",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        danger: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base [&_svg]:size-5",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type NativeButtonProps = Omit<
  HTMLMotionProps<"button">,
  "children" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
>;

export interface ButtonProps extends NativeButtonProps, VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  /** Shows a spinner, sets aria-busy, blocks clicks but keeps keyboard focus. */
  loading?: boolean;
  /** Icon before the label. Replaced by the spinner while loading. */
  leadingIcon?: React.ReactNode;
  /** Icon after the label. */
  trailingIcon?: React.ReactNode;
  /** Render as the child element (e.g. a Next.js Link). No motion in this mode. */
  asChild?: boolean;
}

function Spinner() {
  return (
    <motion.span
      aria-hidden
      className="block size-4 rounded-full border-2 border-current border-r-transparent"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
    />
  );
}

/** Stable key for label crossfades: strings/numbers key on their value. */
const labelKey = (node: React.ReactNode) =>
  typeof node === "string" || typeof node === "number" ? String(node) : "node";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, loading = false, leadingIcon, trailingIcon, asChild, disabled, children, onClick, ...props },
  ref
) {
  const reduce = useReducedMotion();
  const classes = cn(buttonVariants({ variant, size }), className);
  const iconOnly = size === "icon";

  if (asChild) {
    return (
      <Slot ref={ref} className={classes} {...(props as React.HTMLAttributes<HTMLElement>)}>
        {children}
      </Slot>
    );
  }

  if (process.env.NODE_ENV !== "production" && iconOnly && !props["aria-label"]) {
    console.warn("[sagui] Icon-only <Button> needs an aria-label.");
  }

  const handleClick: ButtonProps["onClick"] = (e) => {
    if (loading) { e.preventDefault(); return; }
    onClick?.(e);
  };

  const fade = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } }
    : {
        initial: { opacity: 0, filter: "blur(4px)", y: 4 },
        animate: { opacity: 1, filter: "blur(0px)", y: 0 },
        exit: { opacity: 0, filter: "blur(4px)", y: -4 },
        transition: { duration: 0.18 },
      };

  const lead = loading ? <Spinner key="spinner" /> : leadingIcon;

  return (
    <motion.button
      ref={ref}
      type="button"
      className={classes}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={handleClick}
      layout={reduce ? false : "size"}
      whileTap={reduce || disabled || loading ? undefined : { scale: iconOnly ? 0.92 : 0.97 }}
      transition={{ ...spring.snappy, layout: spring.gentle }}
      {...props}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {lead && (
          <motion.span key={loading ? "spin" : "lead"} className="inline-flex" {...fade}>
            {lead}
          </motion.span>
        )}
      </AnimatePresence>
      {children != null && (
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={labelKey(children)} className="inline-flex items-center" {...fade}>
            {children}
          </motion.span>
        </AnimatePresence>
      )}
      {trailingIcon && <span className="inline-flex">{trailingIcon}</span>}
    </motion.button>
  );
});
