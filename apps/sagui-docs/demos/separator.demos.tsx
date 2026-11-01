"use client";

import { Separator } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="grid w-full max-w-sm gap-3 text-sm text-fg-default">
      <span>Account</span>
      <Separator />
      <div className="flex h-5 items-center gap-3">
        <span>Billing</span>
        <Separator orientation="vertical" decorative />
        <span>Security</span>
      </div>
    </div>
  );
}
// #endregion
