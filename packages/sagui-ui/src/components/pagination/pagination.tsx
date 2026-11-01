import * as React from "react";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Current page, starting at 1. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Visible range, such as "Showing 21–30 of 248". */
  summary?: React.ReactNode;
  /** Auto shows the compact layout on narrow screens. */
  layout?: "auto" | "full" | "compact";
}

/** The first and last pages always show, with up to three around the current one and an ellipsis for gaps. */
function pageItems(page: number, last: number): (number | "gap")[] {
  if (last <= 1) return [1];
  const start = Math.max(2, Math.min(page - 1, last - 3));
  const end = Math.min(last - 1, Math.max(page + 1, 4));
  const middle = Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
  return [1, ...(start > 2 ? ["gap" as const] : []), ...middle, ...(end < last - 1 ? ["gap" as const] : []), last];
}

export function Pagination({ page, pageCount, onPageChange, summary, layout = "auto", className, "aria-label": label = "Pagination", ...props }: PaginationProps) {
  const last = Math.max(1, pageCount);
  const current = Math.min(Math.max(1, page), last);
  const previous = current <= 1;
  const next = current >= last;
  return (
    <nav aria-label={label} className={cn("flex min-w-0 items-center justify-between gap-4", className)} {...props}>
      <span className="min-w-0 text-sm text-fg-muted tabular-nums">{summary}</span>
      {layout !== "compact" ? (
        <div className={cn("flex-none items-center gap-1", layout === "auto" ? "hidden sm:flex" : "flex")}>
          <Button variant="ghost" size="sm" leadingIcon={<ChevronLeft aria-hidden="true" />} disabled={previous} onClick={() => onPageChange(current - 1)}>Previous</Button>
          {pageItems(current, last).map((item, index) => item === "gap"
            ? <span key={`gap-${index}`} aria-hidden="true" className="grid size-8 place-items-center text-fg-muted [&_svg]:size-4"><Ellipsis /></span>
            : <button key={item} type="button" aria-label={`Page ${item}`} aria-current={item === current ? "page" : undefined} onClick={() => onPageChange(item)} className={cn("h-8 min-w-8 cursor-pointer rounded-[var(--radius-control)] border-0 px-2 text-sm font-medium tabular-nums transition-colors duration-[var(--duration-quick)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus motion-reduce:transition-none", item === current ? "bg-accent-default text-fg-on-accent" : "bg-transparent text-fg-subtle hover:bg-bg-muted")}>{item}</button>)}
          <Button variant="ghost" size="sm" trailingIcon={<ChevronRight aria-hidden="true" />} disabled={next} onClick={() => onPageChange(current + 1)}>Next</Button>
        </div>
      ) : null}
      {layout !== "full" ? (
        <div className={cn("flex-none items-center gap-1", layout === "auto" ? "flex sm:hidden" : "flex")}>
          <Button variant="ghost" size="icon" aria-label="Previous page" disabled={previous} onClick={() => onPageChange(current - 1)}><ChevronLeft aria-hidden="true" /></Button>
          <span className="px-2 text-sm font-medium whitespace-nowrap text-fg-default tabular-nums">Page {current} of {last}</span>
          <Button variant="ghost" size="icon" aria-label="Next page" disabled={next} onClick={() => onPageChange(current + 1)}><ChevronRight aria-hidden="true" /></Button>
        </div>
      ) : null}
    </nav>
  );
}
