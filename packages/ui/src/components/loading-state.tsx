"use client"

import { cn } from "@workspace/ui/lib/utils"

type LoadingStateProps = {
  label?: string
  elapsedSeconds?: number
  className?: string
}

export function LoadingState({
  label = "Loading",
  elapsedSeconds = 0,
  className,
}: LoadingStateProps) {
  return (
    <div className={cn("space-y-3 rounded-lg border p-6", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{elapsedSeconds.toFixed(1)}s</span>
      </div>
      <div className="grid grid-cols-8 gap-1">
        {Array.from({ length: 32 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square animate-pulse rounded-sm bg-muted"
            style={{ animationDelay: `${(index % 8) * 75}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
