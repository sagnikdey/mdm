"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@workspace/ui/lib/utils"

function GlassTabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="glass-tabs"
      data-orientation={orientation}
      className={cn(
        "flex gap-4 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

function GlassTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const reduceMotion = useReducedMotion()

  return (
    <div data-slot="glass-tabs-list-wrap" className="relative w-full">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-2xl bg-linear-to-r from-primary/20 via-card/20 to-accent/30 blur-lg"
        animate={{ opacity: reduceMotion ? 0.7 : [0.4, 0.7, 0.4] }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <TabsPrimitive.List
        data-slot="glass-tabs-list"
        className={cn(
          "relative isolate inline-flex h-12 w-full items-center justify-start gap-1 rounded-xl border border-white/25 bg-white/45 p-1 text-card-foreground shadow-[0_8px_32px_color-mix(in_oklch,var(--foreground)_12%,transparent)] backdrop-blur-xl",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:bg-linear-to-b before:from-white/35 before:to-transparent",
          "after:pointer-events-none after:absolute after:inset-px after:rounded-[calc(0.75rem-1px)] after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]",
          "dark:border-white/10 dark:bg-white/8 dark:before:from-white/10 dark:after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]",
          "*:relative *:z-10",
          className
        )}
        {...props}
      />
    </div>
  )
}

function GlassTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="glass-tabs-trigger"
      className={cn(
        "relative inline-flex h-full min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors duration-200",
        "hover:bg-white/20 hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-active:bg-white/40 data-active:text-foreground data-active:shadow-[0_2px_8px_color-mix(in_oklch,var(--foreground)_12%,transparent)]",
        "data-[state=active]:bg-white/40 data-[state=active]:text-foreground",
        "data-active:before:pointer-events-none data-active:before:absolute data-active:before:inset-0 data-active:before:rounded-lg data-active:before:bg-linear-to-b data-active:before:from-white/40 data-active:before:to-transparent",
        "dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white/80",
        "dark:data-active:bg-white/20 dark:data-active:text-white",
        "dark:data-[state=active]:bg-white/20 dark:data-[state=active]:text-white",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function GlassTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="glass-tabs-content"
      className={cn("flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/30", className)}
      {...props}
    />
  )
}

export {
  GlassTabs,
  GlassTabsList,
  GlassTabsTrigger,
  GlassTabsContent,
  GlassTabs as Tabs,
  GlassTabsList as TabsList,
  GlassTabsTrigger as TabsTrigger,
  GlassTabsContent as TabsContent,
}
