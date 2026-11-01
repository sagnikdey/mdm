"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Button, Tooltip } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <Tooltip content="Create a new project">
      <Button variant="outline">New project</Button>
    </Tooltip>
  );
}
// #endregion

// #region Sides
export function Sides() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-8">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side} side={side} content={`Opens ${side}`}>
          <Button variant="outline" size="sm">{side}</Button>
        </Tooltip>
      ))}
    </div>
  );
}
// #endregion

// #region IconTrigger
export function IconTrigger() {
  return (
    <Tooltip content="Seats are billed monthly">
      <Button size="icon" variant="ghost" aria-label="About seats"><Info /></Button>
    </Tooltip>
  );
}
// #endregion

// #region ChangingText
export function ChangingText() {
  const [copied, setCopied] = useState(false);
  return (
    <Tooltip content={copied ? "Copied to clipboard" : "Copy link"}>
      <Button variant="outline" onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }}>Copy</Button>
    </Tooltip>
  );
}
// #endregion
