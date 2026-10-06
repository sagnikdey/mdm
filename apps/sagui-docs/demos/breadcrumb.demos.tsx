"use client";

import { useState } from "react";
import { Breadcrumb, Button } from "@sagui/ui";

// #region Hero
export function Hero() {
  return <Breadcrumb items={[{ label: "Workspace", href: "#" }, { label: "Settings", href: "#" }, { label: "Billing" }]} />;
}
// #endregion

// #region FileBrowser
const folders = ["Files", "Design", "Brand", "Logos"];
export function FileBrowser() {
  const [depth, setDepth] = useState(3);
  return (
    <div className="grid gap-4">
      <Breadcrumb items={folders.slice(0, depth).map((label, index) => ({ label, onClick: () => setDepth(index + 1) }))} />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setDepth((value) => Math.min(folders.length, value + 1))}>Open folder</Button>
        <Button variant="outline" size="sm" onClick={() => setDepth((value) => Math.max(1, value - 1))}>Go up</Button>
      </div>
    </div>
  );
}
// #endregion

// #region Wrapping
export function Wrapping() {
  return (
    <div className="w-56">
      <Breadcrumb items={[{ label: "Organization", href: "#" }, { label: "Engineering", href: "#" }, { label: "Platform", href: "#" }, { label: "Deploys" }]} />
    </div>
  );
}
// #endregion
