"use client";

import { useState } from "react";
import { Switch } from "@sagui/ui";

// #region Hero
export function Hero() {
  const [on, setOn] = useState(true);
  return <Switch label="Auto-save drafts" checked={on} onCheckedChange={setOn} />;
}
// #endregion

// #region Uncontrolled
export function Uncontrolled() {
  return <Switch label="Email notifications" defaultChecked />;
}
// #endregion

// #region IconOnly
export function IconOnly() {
  return <Switch aria-label="Dark mode" />;
}
// #endregion

// #region Disabled
export function Disabled() {
  return (
    <div className="grid gap-1">
      <Switch label="Off and locked" disabled />
      <Switch label="On and locked" disabled defaultChecked />
    </div>
  );
}
// #endregion
