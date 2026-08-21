"use client"

import { LightRays } from "@workspace/ui/components/light-rays"

export function AppLightRays() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden motion-reduce:hidden"
    >
      <LightRays
        count={7}
        color="color-mix(in oklch, var(--primary) 28%, transparent)"
        blur={36}
        speed={14}
        length="100vh"
        className="absolute inset-0"
      />
    </div>
  )
}
