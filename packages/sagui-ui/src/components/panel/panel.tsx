import * as React from "react";
import { cn } from "../../lib/cn";

export type PanelElevation = "flat" | "resting" | "raised";

export interface PanelProps extends React.HTMLAttributes<HTMLElement> {
  /** Shadow under the surface. Flat relies on the border alone. */
  elevation?: PanelElevation;
  /** Renders a landmark or grouping element instead of a div. */
  as?: "div" | "section" | "article" | "aside" | "form";
}

const elevations: Record<PanelElevation, string> = {
  flat: "",
  resting: "shadow-resting",
  raised: "shadow-raised",
};

/** A plain surface for arbitrary content such as forms and detail sections. Use Card for a titled summary with a quick look. */
export const Panel = React.forwardRef<HTMLElement, PanelProps>(function Panel({ elevation = "flat", as: Tag = "div", className, ...props }, ref) {
  return <Tag ref={ref as never} className={cn("min-w-0 rounded-[var(--radius-container)] border border-border-default bg-bg-surface text-fg-default", elevations[elevation], className)} {...(props as React.HTMLAttributes<HTMLElement>)} />;
});

export interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Controls aligned to the end of the header. */
  action?: React.ReactNode;
}

export function PanelHeader({ action, className, children, ...props }: PanelHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 p-5 pb-0", className)} {...props}>
      <div className="grid min-w-0 gap-1">{children}</div>
      {action ? <div className="flex flex-none items-center gap-2">{action}</div> : null}
    </div>
  );
}

export interface PanelTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level, so the panel fits the page outline. */
  as?: "h2" | "h3" | "h4";
}

export function PanelTitle({ as: Tag = "h3", className, ...props }: PanelTitleProps) {
  return <Tag className={cn("m-0 text-base font-medium text-fg-default", className)} {...props} />;
}

export function PanelDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("m-0 text-sm text-fg-muted", className)} {...props} />;
}

export function PanelContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function PanelFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-end gap-3 border-t border-border-default p-5", className)} {...props} />;
}
