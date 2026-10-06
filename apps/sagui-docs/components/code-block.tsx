"use client";

import * as React from "react";
import { FileCode2, Terminal } from "lucide-react";
import { CopyButton } from "@sagui/ui";

/** A highlighted code block with a file name, a copy button and line numbers. */
export function CodeBlock({ title, lang, code, html }: { title: string; lang: string; code: string; html: string }) {
  const Icon = lang === "bash" || lang === "sh" ? Terminal : FileCode2;
  return (
    <figure className="not-prose my-5 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-muted">
      <figcaption className="flex items-center justify-between gap-3 border-b border-border py-1 pr-1.5 pl-3.5">
        <span className="flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground">
          <Icon size={14} aria-hidden="true" />
          <span className="truncate">{title}</span>
        </span>
        <CopyButton value={code} label="Copy" variant="plain" />
      </figcaption>
      <div className={`code ${lang === "bash" || lang === "sh" ? "" : "numbered"} overflow-x-auto text-[13px]`} dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
