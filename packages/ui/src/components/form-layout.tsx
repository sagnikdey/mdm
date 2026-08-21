import * as React from "react"

import { Button } from "@workspace/ui/components/button"
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardFooter,
  GlassCardHeader,
  GlassCardTitle,
} from "@workspace/ui/components/glass-card"
import { cn } from "@workspace/ui/lib/utils"

export type FormLayoutProps = {
  title: string
  description: string
  children: React.ReactNode
  className?: string
  contained?: boolean
  cancelHref?: string
  isSubmitting?: boolean
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  submitLabel?: string
  submittingLabel?: string
  footer?: React.ReactNode
}

export function FormLayout({
  title,
  description,
  children,
  className,
  contained = true,
  cancelHref,
  isSubmitting,
  onSubmit,
  submitLabel = "Save",
  submittingLabel = "Saving...",
  footer,
}: FormLayoutProps) {
  const defaultFooter =
    onSubmit && cancelHref ? (
      <GlassCardFooter className="justify-end gap-3 border-t">
        <Button type="button" variant="outline" size="lg" asChild>
          <a href={cancelHref}>Cancel</a>
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </GlassCardFooter>
    ) : null

  const body = (
    <>
      <GlassCardContent className="space-y-6">{children}</GlassCardContent>
      {footer ?? defaultFooter}
    </>
  )

  const card = (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle className="text-2xl font-bold">{title}</GlassCardTitle>
        <GlassCardDescription>{description}</GlassCardDescription>
      </GlassCardHeader>
      {onSubmit ? <form onSubmit={onSubmit}>{body}</form> : body}
    </GlassCard>
  )

  if (!contained) {
    return <div className={className}>{card}</div>
  }

  return <div className={cn("mx-auto max-w-3xl p-6", className)}>{card}</div>
}
