import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";

export type StepperStepStatus = "complete" | "current" | "upcoming" | "error";

export interface StepperStep {
  label: React.ReactNode;
  /** Set for a step with fields to fix. Other steps take their status from `current`. */
  error?: boolean;
}

export interface StepperProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  steps: StepperStep[];
  /** Zero-based index of the current step. Exactly one step is current. */
  current: number;
  /** Replaces the "Step 3 of 8" caption. */
  caption?: React.ReactNode;
}

const indicators: Record<StepperStepStatus, string> = {
  complete: "bg-success-default text-fg-on-accent",
  current: "bg-accent-default text-fg-on-accent",
  upcoming: "border border-border-strong bg-bg-surface text-fg-muted",
  error: "border border-danger-border bg-danger-subtle text-danger-default",
};

const labels: Record<StepperStepStatus, string> = {
  complete: "type-body-sm text-fg-default",
  current: "type-label text-fg-default",
  upcoming: "type-body-sm text-fg-muted",
  error: "type-body-sm text-fg-default",
};

/** Hidden text, so a step's state is never carried by color alone. */
const statusText: Partial<Record<StepperStepStatus, string>> = {
  complete: "Completed: ",
  error: "Needs attention: ",
};

/** A vertical progress list for a linear, multi-step flow, used as the left rail beside the current step's form. */
export function Stepper({ steps, current, caption, className, "aria-label": ariaLabel = "Progress", ...props }: StepperProps) {
  return (
    <nav aria-label={ariaLabel} className={cn("flex w-full flex-col gap-1", className)} {...props}>
      <p className="mb-1 text-xs text-fg-muted">{caption ?? `Step ${current + 1} of ${steps.length}`}</p>
      <ol className="flex flex-col gap-1">
        {steps.map((step, index) => {
          const isCurrent = index === current;
          const status: StepperStepStatus = step.error ? "error" : isCurrent ? "current" : index < current ? "complete" : "upcoming";
          return (
            <li
              key={index}
              aria-current={isCurrent ? "step" : undefined}
              className={cn("flex min-h-10 items-center gap-3 rounded-control px-2.5 py-2", isCurrent && "bg-bg-muted")}
            >
              <span aria-hidden className={cn("flex size-6 shrink-0 items-center justify-center rounded-pill text-xs font-medium", indicators[status])}>
                {status === "complete" ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span className={labels[status]}>
                {statusText[status] && <span className="sr-only">{statusText[status]}</span>}
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
