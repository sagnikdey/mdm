import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../../lib/cn";

export const Popover = PopoverPrimitive.Root;
export const PopoverClose = PopoverPrimitive.Close;

/** The trigger anchors the panel, so it opts out of press-scale: a scaled rect measured on open would shift the panel as the trigger springs back. */
export const PopoverTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>>(function PopoverTrigger({ className, ...props }, ref) {
  return <PopoverPrimitive.Trigger {...props} ref={ref} className={cn("active:enabled:!transform-none", className)} />;
});
PopoverTrigger.displayName = "PopoverTrigger";

const content = [
  "z-80 min-w-48 max-w-[min(22rem,calc(100vw-20px))] rounded-[var(--radius-xl)] border border-border bg-surface p-4 text-foreground shadow-floating focus:outline-none",
  "origin-[var(--radix-popover-content-transform-origin)]",
  // The panel starts a few pixels toward its trigger and settles on a spring; it leaves faster than it arrives.
  // Transitions instead of keyframes, so a close that interrupts the open, or a reopen during the close, reverses from where the panel is.
  "[--popover-x:0px] [--popover-y:-5px] data-[side=top]:[--popover-y:5px]",
  "data-[side=left]:[--popover-x:5px] data-[side=left]:[--popover-y:0px] data-[side=right]:[--popover-x:-5px] data-[side=right]:[--popover-y:0px]",
  "[transition:opacity_var(--duration-fast)_var(--ease-enter),transform_var(--duration-spring)_var(--ease-spring)]",
  "starting:data-[state=open]:opacity-0 starting:data-[state=open]:[transform:translate(var(--popover-x),var(--popover-y))_scale(.97)]",
  "data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 data-[state=closed]:animate-[sg-exit_120ms_linear_both]",
  "data-[state=closed]:[transform:translate(calc(var(--popover-x)*.5),calc(var(--popover-y)*.5))_scale(.98)]",
  "data-[state=closed]:[transition:opacity_120ms_var(--ease-out-quint),transform_120ms_var(--ease-out-quint)]",
  "motion-reduce:!transform-none motion-reduce:![transition:opacity_var(--duration-fast)_linear]",
].join(" ");

/** A small anchored surface for contextual information. Non-modal: focus moves in, Escape and outside clicks close it. */
export const PopoverContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>>(function PopoverContent({ className, align = "start", sideOffset = 6, collisionPadding = 10, ...props }, ref) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content {...props} ref={ref} align={align} sideOffset={sideOffset} collisionPadding={collisionPadding} className={cn(content, className)} />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = "PopoverContent";
