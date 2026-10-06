/** Class strings for Radix dropdown menus used by split and grouped buttons. The menu grows from its anchor edge and leaves faster than it arrives. */
export const menuContent = [
  "group/menu z-60 p-[5px] rounded-[var(--radius-xl)] border border-border bg-surface text-foreground shadow-floating",
  "min-w-[min(12rem,var(--radix-dropdown-menu-content-available-width))] max-w-[var(--radix-dropdown-menu-content-available-width)]",
  "origin-[var(--radix-dropdown-menu-content-transform-origin)]",
  "[--menu-x:0px] [--menu-y:-5px] data-[side=top]:[--menu-y:5px]",
  "data-[side=left]:[--menu-x:5px] data-[side=left]:[--menu-y:0px] data-[side=right]:[--menu-x:-5px] data-[side=right]:[--menu-y:0px]",
  "[transition:opacity_var(--duration-fast)_var(--ease-enter),transform_var(--duration-spring)_var(--ease-spring)]",
  "starting:data-[state=open]:opacity-0 starting:data-[state=open]:[transform:translate(var(--menu-x),var(--menu-y))_scale(.97)]",
  // Radix unmounts when the exit animation ends, so a no-op keyframe times the exit while the transition does the visual work.
  "data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 data-[state=closed]:animate-[sg-exit_130ms_linear_both]",
  "data-[state=closed]:[transform:translate(calc(var(--menu-x)*.5),calc(var(--menu-y)*.5))_scale(.985)]",
  "data-[state=closed]:[transition:opacity_130ms_var(--ease-out-quint),transform_130ms_var(--ease-out-quint)]",
  "motion-reduce:!transform-none motion-reduce:![transition:opacity_var(--duration-fast)_linear]",
].join(" ");

/** The highlight follows the pointer and arrow keys instantly, like a native menu. */
export const menuItem = [
  "flex min-h-9 items-center gap-2.5 px-[11px] rounded-[calc(var(--radius-xl)-6px)] text-sm text-inherit no-underline cursor-pointer outline-none select-none",
  "data-[highlighted]:bg-muted data-[disabled]:cursor-default data-[disabled]:opacity-45",
  "[transition:opacity_var(--duration-standard)_var(--ease-enter)_calc(min(var(--i,0),4)*35ms),transform_var(--duration-standard)_var(--ease-enter)_calc(min(var(--i,0),4)*35ms)]",
  "starting:group-data-[state=open]/menu:opacity-0 starting:group-data-[state=open]/menu:[transform:translate(calc(var(--menu-x)*.4),calc(var(--menu-y)*.4))]",
  "motion-reduce:transition-none",
].join(" ");

export const menuItemDestructive = "text-destructive data-[highlighted]:bg-[color-mix(in_oklab,var(--color-destructive)_8%,var(--color-surface))]";

/** Radix Select content: the same grow-from-the-trigger motion as the dropdown menu. */
export const selectContent = [
  "group/menu z-1000 box-border w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] max-w-[min(24rem,calc(100vw-20px))]",
  "max-h-[min(320px,var(--radix-select-content-available-height))] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface p-1.5 text-foreground shadow-floating",
  "origin-[var(--radix-select-content-transform-origin)]",
  "[--menu-x:0px] [--menu-y:-6px] data-[side=top]:[--menu-y:6px]",
  "data-[side=left]:[--menu-x:6px] data-[side=left]:[--menu-y:0px] data-[side=right]:[--menu-x:-6px] data-[side=right]:[--menu-y:0px]",
  "[transition:opacity_var(--duration-fast)_var(--ease-enter),transform_var(--duration-spring)_var(--ease-spring)]",
  "starting:data-[state=open]:opacity-0 starting:data-[state=open]:[transform:translate(var(--menu-x),var(--menu-y))_scale(.97)]",
  "data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 data-[state=closed]:animate-[sg-exit_130ms_linear_both]",
  "data-[state=closed]:[transform:translate(calc(var(--menu-x)*.5),calc(var(--menu-y)*.5))_scale(.985)]",
  "data-[state=closed]:[transition:opacity_130ms_var(--ease-out-quint),transform_130ms_var(--ease-out-quint)]",
  "motion-reduce:!transform-none motion-reduce:![transition:opacity_var(--duration-fast)_linear]",
].join(" ");
