"use client";

import { useState } from "react";
import { Copy, Hand, MousePointer2, Redo2, Share2, Undo2 } from "lucide-react";
import { FloatingButtonGroup } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <FloatingButtonGroup
      label="Board actions"
      items={[
        { id: "undo", label: "Undo", icon: <Undo2 />, shortcut: "⌘Z" },
        { id: "redo", label: "Redo", icon: <Redo2 />, shortcut: "⇧⌘Z" },
        { type: "separator" },
        { id: "copy", label: "Duplicate", icon: <Copy /> },
        { id: "share", label: "Share", icon: <Share2 />, reserveLabels: ["Share", "Copied"] },
      ]}
    />
  );
}
// #endregion

// #region Floating
export function Floating() {
  return (
    <FloatingButtonGroup
      variant="floating"
      label="Selection"
      items={[
        { id: "copy", label: "Duplicate", icon: <Copy /> },
        { id: "share", label: "Share", icon: <Share2 /> },
      ]}
    />
  );
}
// #endregion

// #region IconOnly
export function IconOnly() {
  return (
    <FloatingButtonGroup
      iconOnly
      label="History"
      items={[
        { id: "undo", label: "Undo", icon: <Undo2 />, shortcut: "⌘Z" },
        { id: "redo", label: "Redo", icon: <Redo2 />, shortcut: "⇧⌘Z" },
      ]}
    />
  );
}
// #endregion

// #region ToolsRail
export function ToolsRail() {
  const [tool, setTool] = useState("select");
  return (
    <div className="grid place-items-center pr-24">
      <FloatingButtonGroup
        orientation="vertical"
        variant="floating"
        iconOnly
        label="Tools"
        onAction={setTool}
        items={[
          { id: "select", label: "Select", icon: <MousePointer2 />, pressed: tool === "select", shortcut: "V" },
          { id: "hand", label: "Hand", icon: <Hand />, pressed: tool === "hand", shortcut: "H" },
        ]}
      />
    </div>
  );
}
// #endregion

// #region Small
export function Small() {
  return <FloatingButtonGroup size="sm" label="Formatting" items={[{ id: "copy", label: "Copy", icon: <Copy /> }, { id: "share", label: "Share", icon: <Share2 /> }]} />;
}
// #endregion
