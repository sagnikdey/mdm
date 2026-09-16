import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@workspace/ui/components/glass-card"

export function GlassCardDemo() {
  return (
    <GlassCard className="w-full max-w-md">
      <GlassCardHeader>
        <GlassCardTitle>Glass surface</GlassCardTitle>
        <GlassCardDescription>
          Frosted panel with primary accent glow
        </GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent>
        <p className="text-sm text-muted-foreground">
          Used on dashboards and vendor flows for elevated content.
        </p>
      </GlassCardContent>
    </GlassCard>
  )
}
