import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Full name. Provides the initials fallback and the accessible name. */
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline";
}

const sizes = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-12 text-sm",
  xl: "size-[88px] text-xl",
};
const dots = {
  sm: "size-2 border-[1.5px]",
  md: "size-2.5 border-2",
  lg: "size-3 border-2",
  xl: "right-1 bottom-1 size-3.5 border-2",
};

/** A person's photo, falling back to initials when there is no photo or it fails to load. */
export function Avatar({ name, src, size = "md", status, className, ...props }: AvatarProps) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  const reduce = !!useReducedMotion();
  const image = React.useRef<HTMLImageElement>(null);
  const [failedSrc, setFailedSrc] = React.useState<string>();
  // A photo that is already decoded shows at once. One that is still loading waits, then fades in from a soft blur.
  React.useLayoutEffect(() => {
    const node = image.current;
    if (node && !node.complete) node.dataset.loading = "";
  }, [src]);
  const showImage = src && failedSrc !== src;
  return (
    <span
      {...props}
      className={cn("relative inline-grid flex-none place-items-center overflow-visible rounded-full border border-border bg-muted font-medium text-foreground", sizes[size], className)}
      role="img"
      aria-label={`${name}${status ? `, ${status}` : ""}`}
    >
      {showImage ? (
        <img
          key={src}
          ref={image}
          src={src}
          alt=""
          draggable={false}
          onLoad={(event) => { delete event.currentTarget.dataset.loading; }}
          onError={() => setFailedSrc(src)}
          className="pointer-events-none absolute inset-0 size-full rounded-[inherit] object-cover transition-[opacity,filter] duration-standard ease-enter data-[loading]:opacity-0 data-[loading]:blur-[4px] data-[loading]:transition-none motion-reduce:transition-none motion-reduce:data-[loading]:blur-none"
        />
      ) : (
        <span className={cn(src && "animate-[sg-resolve_var(--duration-standard)_var(--ease-enter)_both] motion-reduce:animate-none")} aria-hidden="true">{initials}</span>
      )}
      <AnimatePresence initial={false}>
        {status && (
          <motion.i
            key={status}
            className={cn("absolute right-0 bottom-0 z-[2] rounded-full border-surface shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-border)_70%,transparent)]", dots[size], status === "online" ? "bg-success" : "bg-muted-foreground")}
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6, transition: { duration: reduce ? 0 : duration.fast } }}
            transition={reduce ? { duration: 0 } : spring.snappy}
          />
        )}
      </AnimatePresence>
    </span>
  );
}
