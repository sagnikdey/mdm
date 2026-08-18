"use client"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

type ApprovalAction = {
  label: string
  variant?: "default" | "outline" | "destructive" | "secondary"
  onClick: () => void
  disabled?: boolean
}

type ApprovalCardProps = {
  title: string
  description?: string
  question: string
  actions: ApprovalAction[]
  className?: string
}

export function ApprovalCard({
  title,
  description,
  question,
  actions,
  className,
}: ApprovalCardProps) {
  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium">{question}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            size="lg"
            variant={action.variant ?? "default"}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.label}
          </Button>
        ))}
      </CardFooter>
    </Card>
  )
}
