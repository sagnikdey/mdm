import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

function GlassCard({
  className,
  glowEffect = true,
  spacing = "relaxed",
  ...props
}: React.ComponentProps<"div"> & {
  glowEffect?: boolean
  spacing?: "compact" | "relaxed"
}) {
  return (
    <div data-slot="glass-card-wrap" className="relative">
      {glowEffect ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl bg-linear-to-r from-primary/20 via-card/20 to-accent/30 opacity-70 blur-xl"
        />
      ) : null}
      <div
        data-slot="glass-card"
        data-spacing={spacing}
        className={cn(
          "relative isolate flex flex-col gap-(--card-spacing) overflow-hidden rounded-2xl border border-white/25 bg-white/45 py-(--card-spacing) text-card-foreground shadow-[0_8px_32px_color-mix(in_oklch,var(--foreground)_12%,transparent)] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-linear-to-b before:from-white/35 before:to-transparent after:pointer-events-none after:absolute after:inset-px after:rounded-[calc(1rem-1px)] after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:border-white/10 dark:bg-white/8 dark:before:from-white/10 dark:after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] *:relative *:z-10",
          className
        )}
        {...props}
      />
    </div>
  )
}

function GlassCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-header"
      className={cn(
        "grid auto-rows-min items-start gap-1 px-(--card-spacing) has-data-[slot=glass-card-action]:grid-cols-[1fr_auto]",
        className
      )}
      {...props}
    />
  )
}

function GlassCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-title"
      className={cn("font-heading text-sm font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
}

function GlassCardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-description"
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

function GlassCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-content"
      className={cn("p-(--card-spacing)", className)}
      {...props}
    />
  )
}

function GlassCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-footer"
      className={cn(
        "flex items-center px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
}
