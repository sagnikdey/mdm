"use client";

import * as React from "react";
import { Check, Clock, Rocket } from "lucide-react";
import { Badge, Button } from "@sagui/ui";

const steps = [
  { tone: "neutral", icon: <Clock size={12} />, label: "Queued", action: "Deploy" },
  { tone: "warning", icon: <Rocket size={12} />, label: "Deploying to production", action: "Deploying" },
  { tone: "success", icon: <Check size={12} />, label: "Live", action: "Deploy again" },
] as const;

/** One badge and one button, kept mounted, so each step morphs instead of swapping. */
export function MotionDemo() {
  const [step, setStep] = React.useState(0);
  const current = steps[step];
  return (
    <div className="grid w-full max-w-sm gap-6 rounded-[var(--radius-xl)] border border-border bg-surface p-6 shadow-raised">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="type-title">sagui-docs</p>
          <p className="type-caption text-muted-foreground">main · ae8d0ea</p>
        </div>
        <Badge tone={current.tone} icon={current.icon}>{current.label}</Badge>
      </div>
      <Button onClick={() => setStep((value) => (value + 1) % steps.length)}>{current.action}</Button>
      <p className="type-caption text-muted-foreground">Click through the steps: the badge and the button keep their place while their content morphs.</p>
    </div>
  );
}
