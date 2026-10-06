"use client";

import { useState } from "react";
import { Archive, Check, Link, Minus, Plus, Share2, Star, Trash2 } from "lucide-react";
import { ButtonGroup } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="h-52 w-full">
      <div className="flex justify-center">
        <ButtonGroup
          label="Document actions"
          items={[
            { id: "edit", label: "Edit" },
            { id: "share", label: "Share", icon: <Share2 /> },
            { id: "star", label: "Star", icon: <Star /> },
          ]}
          menu={{
            label: "More actions",
            items: [
              { id: "archive", label: "Archive", icon: <Archive /> },
              { id: "link", label: "Copy link", icon: <Link /> },
              { id: "delete", label: "Delete", icon: <Trash2 />, destructive: true },
            ],
          }}
        />
      </div>
    </div>
  );
}
// #endregion

// #region Solid
export function Solid() {
  return (
    <ButtonGroup
      variant="solid"
      label="Publishing"
      items={[{ id: "preview", label: "Preview" }, { id: "schedule", label: "Schedule" }, { id: "publish", label: "Publish" }]}
    />
  );
}
// #endregion

// #region Small
export function Small() {
  return <ButtonGroup size="sm" label="View" items={[{ id: "list", label: "List" }, { id: "board", label: "Board" }, { id: "timeline", label: "Timeline" }]} />;
}
// #endregion

// #region ConfirmInPlace
export function ConfirmInPlace() {
  const [copied, setCopied] = useState(false);
  return (
    <ButtonGroup
      label="Share actions"
      items={[
        { id: "edit", label: "Edit" },
        {
          id: "share",
          label: copied ? "Copied" : "Share",
          reserve: ["Share", "Copied"],
          icon: copied ? <Check /> : <Link />,
          onSelect: () => { setCopied(true); setTimeout(() => setCopied(false), 1600); },
        },
      ]}
    />
  );
}
// #endregion

// #region ZoomControls
export function ZoomControls() {
  const [zoom, setZoom] = useState(100);
  return (
    <ButtonGroup
      label="Zoom"
      orientation="vertical"
      items={[
        { id: "in", label: "Zoom in", icon: <Plus />, iconOnly: true, onSelect: () => setZoom((z) => Math.min(200, z + 25)) },
        { id: "level", label: "Zoom level", content: `${zoom}%`, disabled: true },
        { id: "out", label: "Zoom out", icon: <Minus />, iconOnly: true, onSelect: () => setZoom((z) => Math.max(25, z - 25)) },
      ]}
    />
  );
}
// #endregion

// #region Disabled
export function Disabled() {
  return <ButtonGroup disabled label="Locked" items={[{ id: "edit", label: "Edit" }, { id: "share", label: "Share" }]} />;
}
// #endregion
