import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";
import { Avatar } from "../avatar/avatar";

export interface AvatarGroupMember { name: string; src?: string; status?: "online" | "offline" }
export interface AvatarGroupProps {
  members: AvatarGroupMember[];
  /** People shown before the rest collapse into a "+N" count. */
  max?: number;
  size?: "sm" | "md" | "lg";
  /** Accessible name of the group. */
  label?: string;
  className?: string;
}

/** The overflow count rolls the way it moved: more people rise in from below, fewer drop in from above. */
const rise: Variants = {
  hidden: (direction: number) => ({ opacity: 0, y: `${0.4 * direction}em`, filter: `blur(${blur.subtle}px)` }),
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.standard, ease: easeEnter } },
  gone: (direction: number) => ({ opacity: 0, y: `${-0.4 * direction}em`, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.quick, ease: easeStandard } }),
};
// Same keys as `rise` so the settled style is identical whichever branch renders on the server.
const fade: Variants = {
  hidden: { opacity: 0, y: 0, filter: "blur(0px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.instant } },
  gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: duration.instant } },
};
// A person joining or leaving opens or closes their slot, so the rest of the stack slides instead of jumping.
const slot = { initial: { width: 0, opacity: 0, scale: 0.9 }, animate: { width: "auto", opacity: 1, scale: 1 }, exit: { width: 0, opacity: 0, scale: 0.9 } };

const heights = { sm: "h-7", md: "h-9", lg: "h-12" };
const overflowSizes = { sm: "size-7 text-[10px]", md: "size-9 text-xs", lg: "size-12 text-sm" };
const ring = "border-2 border-surface shadow-[0_0_0_1px_var(--color-border)] transition-shadow duration-fast ease-out-quint";

/** Overlapping avatars with a "+N" overflow. Pointing at the stack fans it out, and the person under the pointer names themselves. */
export function AvatarGroup({ members, max = 4, size = "md", label = "Team members", className }: AvatarGroupProps) {
  const reduce = !!useReducedMotion();
  const visible = members.slice(0, Math.max(0, max));
  const overflow = Math.max(0, members.length - visible.length);
  const transition = (reduce ? { duration: 0 } : spring.morph) as never;
  const [count, setCount] = React.useState({ overflow, direction: 1 });
  if (count.overflow !== overflow) setCount({ overflow, direction: overflow < count.overflow ? -1 : 1 });
  const total = visible.length + (overflow > 0 ? 1 : 0);
  // Each slot is the avatar's visible width. One wrapper per person carries every hover move as a single translate, so the stack never changes size.
  const slotClass = cn("group/slot relative inline-flex flex-none items-center [@media(hover:hover)_and_(pointer:fine)]:hover:z-[1]", heights[size]);
  const lift = "relative -ml-1.5 inline-flex rounded-full [--fan:0px] [--aside:0px] [--rise:0px] [transform:translate(calc(var(--fan)+var(--aside)),var(--rise))] transition-[transform,box-shadow] duration-standard ease-out-quint motion-reduce:!transform-none motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:group-hover/group:[--fan:calc((var(--index)-(var(--count)-1)/2)*4px)] [@media(hover:hover)_and_(pointer:fine)]:group-hover/slot:[--rise:-2px] [@media(hover:hover)_and_(pointer:fine)]:[[data-slot]:hover~[data-slot]_&]:[--aside:3px] [@media(hover:hover)_and_(pointer:fine)]:[[data-slot]:has(~[data-slot]:hover)_&]:[--aside:-3px]";
  const tip = "pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-[2] -translate-x-1/2 translate-y-[3px] whitespace-nowrap rounded-full bg-foreground px-2 py-1 text-xs font-medium leading-relaxed text-background opacity-0 transition-[opacity,translate] duration-fast ease-out-quint [@media(hover:hover)_and_(pointer:fine)]:group-hover/slot:translate-y-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover/slot:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover/slot:delay-[60ms] motion-reduce:translate-y-0 motion-reduce:transition-none";
  return (
    <div
      className={cn("group/group inline-flex items-center pl-1.5", heights[size], className)}
      role="group"
      aria-label={label}
      style={{ "--count": total } as React.CSSProperties}
    >
      <AnimatePresence initial={false}>
        {visible.map((member, index) => (
          <motion.span key={member.name} data-slot="" className={slotClass} style={{ "--index": index } as React.CSSProperties} {...slot} transition={transition}>
            <span className={lift}>
              <Avatar className={cn(ring, "[@media(hover:hover)_and_(pointer:fine)]:group-hover/slot:shadow-[0_0_0_1px_var(--color-border-strong)]")} name={member.name} src={member.src} status={member.status} size={size} />
              <span className={tip} aria-hidden="true">{member.name}</span>
            </span>
          </motion.span>
        ))}
        {overflow > 0 ? (
          <motion.span key="overflow" data-slot="" className={slotClass} style={{ "--index": visible.length } as React.CSSProperties} {...slot} transition={transition}>
            <span className={cn(lift, ring, "relative inline-grid place-items-center overflow-hidden bg-muted font-medium tabular-nums text-muted-foreground", overflowSizes[size])} role="img" aria-label={`${overflow} more ${label.toLowerCase()}`}>
              <AnimatePresence mode="popLayout" initial={false} custom={count.direction}>
                <motion.span key={overflow} className="inline-block" custom={count.direction} variants={reduce ? fade : rise} initial="hidden" animate="shown" exit="gone" aria-hidden="true">+{overflow}</motion.span>
              </AnimatePresence>
            </span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
