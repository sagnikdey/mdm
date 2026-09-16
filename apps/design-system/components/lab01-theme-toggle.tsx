"use client"

import { useTheme } from "next-themes"

import { cn } from "@workspace/ui/lib/utils"

export function Lab01ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const active = resolvedTheme === "dark" ? "dark" : "light"

  return (
    <div
      className="flex items-center gap-1 text-sm text-muted-foreground"
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "rounded px-2 py-1 transition-colors hover:text-foreground",
          active === "light" && "font-medium text-foreground"
        )}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "rounded px-2 py-1 transition-colors hover:text-foreground",
          active === "dark" && "font-medium text-foreground"
        )}
      >
        Dark
      </button>
    </div>
  )
}
