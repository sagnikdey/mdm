import * as React from "react";
import { cn } from "../../lib/cn";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  /** Hides the line from assistive technology when it is purely visual. */
  decorative?: boolean;
}

export function Separator({ orientation = "horizontal", decorative = false, className, ...props }: SeparatorProps) {
  const semantics = decorative ? { role: "none" } : { role: "separator", "aria-orientation": orientation };
  return <div {...semantics} data-orientation={orientation} className={cn("flex-none bg-border-default", orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch", className)} {...props} />;
}
