"use client"

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

export type TaskRowStatus = "pending" | "running" | "completed" | "failed"

export type TaskRowItem = {
  id: string
  label: string
  status: TaskRowStatus
  detail?: string
}

type TaskRowsProps = {
  tasks: TaskRowItem[]
  className?: string
}

function StatusIcon({ status }: { status: TaskRowStatus }) {
  switch (status) {
    case "running":
      return <Loader2 className="size-4 animate-spin text-primary" />
    case "completed":
      return <CheckCircle2 className="size-4 text-green-600" />
    case "failed":
      return <XCircle className="size-4 text-destructive" />
    default:
      return <Circle className="size-4 text-muted-foreground" />
  }
}

export function TaskRows({ tasks, className }: TaskRowsProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-start gap-3 rounded-lg border bg-card px-3 py-2"
        >
          <StatusIcon status={task.status} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{task.label}</p>
            {task.detail ? (
              <p className="text-xs text-muted-foreground">{task.detail}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
