"use client";

import { FileText } from "lucide-react";
import { CopyButton } from "@sagui/ui";

/** Header actions: the import line, copy the whole page as Markdown, or open it raw. */
export function PageActions({ importLine, markdown, markdownHref }: { importLine: string; markdown: string; markdownHref: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex h-8 min-w-0 items-center gap-1 rounded-[var(--radius-md)] border border-border-default bg-bg-muted py-0 pr-0.5 pl-3">
        <code className="truncate font-mono text-xs text-fg-default">{importLine}</code>
        <CopyButton value={importLine} label="Copy import" variant="plain" iconOnly />
      </div>
      <CopyButton value={markdown} label="Copy page" />
      <a
        href={markdownHref}
        className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-md)] px-2.5 text-sm text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <FileText size={14} aria-hidden="true" /> Markdown
      </a>
    </div>
  );
}
