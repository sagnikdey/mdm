"use client";

import { CopyButton } from "@sagui/ui";

// #region Hero
export function Hero() {
  return <CopyButton value="npm install @sagui/ui" />;
}
// #endregion

// #region Plain
export function Plain() {
  return <CopyButton variant="plain" value="https://sagui.dev/components/copy-button" label="Copy link" />;
}
// #endregion

// #region IconOnly
export function IconOnly() {
  return <CopyButton iconOnly value="demo_key_8f3a2c91" label="Copy key" />;
}
// #endregion

// #region InCodeBlock
export function InCodeBlock() {
  const command = "npm install @sagui/ui";
  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-border bg-muted py-1.5 pr-1.5 pl-4 font-mono text-sm">
      <code>{command}</code>
      <CopyButton value={command} variant="plain" />
    </div>
  );
}
// #endregion
