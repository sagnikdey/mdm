import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  /** Visible label, and the accessible name. Without one, pass `aria-label`. */
  label?: string;
}

/** Track inner width (42 - 6 padding) minus the 18px thumb. */
const size = 18;
const travel = 18;
/** How far the thumb widens toward the other side while pressed. */
const stretch = 5;
/** Critically damped: the thumb lands on its end without overshooting the state it reports. */
const glide: Transition = { type: "spring", visualDuration: 0.3, bounce: 0 };

/** A tactile toggle for settings that take effect immediately. The thumb stretches under a press, then travels on a spring. */
export const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(function Switch(
  { label, className, checked, defaultChecked, onCheckedChange, onPointerDown, onPointerUp, onPointerLeave, onPointerCancel, onKeyDown, onKeyUp, onBlur, ...props }, ref
) {
  const reduceMotion = useReducedMotion();
  const [internal, setInternal] = React.useState(defaultChecked ?? false);
  const [pressed, setPressed] = React.useState(false);
  const on = checked ?? internal;
  // A brief stretch along the travel, so the thumb reads as moving mass rather than a sliding dot.
  const scaleX = useMotionValue(1);
  const shown = React.useRef(on);
  // A pointer or Space press already stretched the thumb, so its release should not add a second stretch on top.
  const releasedAt = React.useRef(-Infinity);
  React.useEffect(() => {
    if (shown.current === on) return;
    shown.current = on;
    const fromPress = performance.now() - releasedAt.current < 250;
    if (reduceMotion || fromPress) return;
    const controls = animate(scaleX, [1, 1.16, 1], { duration: 0.34, times: [0, 0.4, 1], ease: ["easeOut", "easeInOut"] });
    return () => controls.stop();
  }, [on, reduceMotion, scaleX]);
  const extra = pressed && !reduceMotion && !props.disabled ? stretch : 0;

  return (
    <SwitchPrimitive.Root
      {...props}
      ref={ref}
      checked={on}
      onCheckedChange={(next) => { if (checked === undefined) setInternal(next); onCheckedChange?.(next); }}
      onPointerDown={(event) => { onPointerDown?.(event); if (event.button === 0) setPressed(true); }}
      onPointerUp={(event) => { onPointerUp?.(event); if (pressed && !props.disabled) releasedAt.current = performance.now(); setPressed(false); }}
      onPointerLeave={(event) => { onPointerLeave?.(event); setPressed(false); }}
      onPointerCancel={(event) => { onPointerCancel?.(event); setPressed(false); }}
      onKeyDown={(event) => { onKeyDown?.(event); if (event.key === " ") setPressed(true); }}
      onKeyUp={(event) => { onKeyUp?.(event); if (pressed && !props.disabled) releasedAt.current = performance.now(); setPressed(false); }}
      onBlur={(event) => { onBlur?.(event); setPressed(false); }}
      className={cn("group/sw inline-flex min-h-10 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-sm text-foreground [-webkit-tap-highlight-color:transparent] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50", className)}
      aria-label={props["aria-label"] ?? label}
    >
      {/* Fixed box: the thumb moves inside it with transforms, so nothing around the switch shifts. The track crossfades between the two fills. */}
      <span
        className={cn(
          "relative isolate box-border flex h-6 w-[42px] flex-none items-center rounded-full bg-[color-mix(in_oklab,var(--color-foreground)_18%,var(--color-surface))] p-[3px]",
          "transition-colors duration-[var(--duration-quick)] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
          "before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:bg-primary before:opacity-0 before:transition-opacity before:duration-[var(--duration-standard)] before:content-[''] group-data-[state=checked]/sw:before:opacity-100 motion-reduce:before:transition-none",
          "[@media(hover:hover)_and_(pointer:fine)]:group-hover/sw:group-enabled/sw:group-data-[state=unchecked]/sw:bg-[color-mix(in_oklab,var(--color-foreground)_26%,var(--color-surface))]",
          "group-focus-visible/sw:ring-2 group-focus-visible/sw:ring-ring group-focus-visible/sw:ring-offset-2 group-focus-visible/sw:ring-offset-background"
        )}
      >
        {/* The thumb stretches like a held finger and keeps its far edge anchored, then travels on a spring. */}
        <motion.span
          className="size-[18px] flex-none rounded-full bg-white shadow-[0_0_0_.5px_oklch(0%_0_0/.07),0_1px_2px_oklch(0%_0_0/.14),0_2px_6px_oklch(0%_0_0/.06)] will-change-transform"
          style={{ scaleX }}
          initial={false}
          animate={{ x: on ? travel - extra : 0, width: size + extra }}
          transition={reduceMotion ? { duration: 0 } : ({ x: glide, width: spring.snappy } as never)}
        />
      </span>
      {label ? <span className="leading-snug">{label}</span> : null}
    </SwitchPrimitive.Root>
  );
});
Switch.displayName = "Switch";
