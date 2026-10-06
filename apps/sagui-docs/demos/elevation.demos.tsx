"use client";

import { Button, Popover, PopoverContent, PopoverTrigger, Tooltip } from "@sagui/ui";

// #region Levels
const levels = [
  { level: 0, token: "none", use: "Page sections, inline content" },
  { level: 1, token: "shadow-resting", use: "Controls and cards at rest" },
  { level: 2, token: "shadow-raised", use: "Hovered cards, tooltips" },
  { level: 3, token: "shadow-floating", use: "Menus, popovers, toasts" },
  { level: 4, token: "shadow-overlay", use: "Dialogs and drawers" },
];

export function Levels() {
  return (
    <div className="grid w-full grid-cols-2 gap-5 bg-background p-2 sm:grid-cols-3 xl:grid-cols-5">
      {levels.map(({ level, token, use }) => (
        <div key={token} className={`grid min-h-32 content-between rounded-[var(--radius-container)] border border-border bg-surface p-4 ${level ? token : ""}`}>
          <span className="type-h2 text-muted-foreground tabular-nums">{level}</span>
          <div>
            <code className="type-code block text-xs text-foreground">{token}</code>
            <p className="type-caption mt-1 text-muted-foreground">{use}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
// #endregion

// #region Hover
export function Hover() {
  return (
    <a
      href="#elevation-and-motion"
      className="block w-full max-w-xs rounded-[var(--radius-container)] border border-border bg-surface p-5 shadow-resting transition-[translate,box-shadow,border-color] duration-quick ease-out-quint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:border-border-strong [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-raised motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <p className="type-title">Hover me</p>
      <p className="type-body-sm mt-1 text-muted-foreground">Rests at level 1 and lifts to level 2 by 2px.</p>
    </a>
  );
}
// #endregion

// #region Layers
export function Layers() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tooltip content="Tooltips sit on top of everything">
        <Button variant="outline">Tooltip</Button>
      </Tooltip>
      <Popover>
        <PopoverTrigger asChild><Button variant="outline">Popover</Button></PopoverTrigger>
        <PopoverContent>
          <p className="type-label">Level 3</p>
          <p className="type-body-sm text-muted-foreground">Floating layers use shadow-floating.</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
// #endregion
