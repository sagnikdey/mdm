"use client";

import { Select } from "@sagui/ui";

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner", disabled: true },
];

// #region Hero
export function Hero() {
  return (
    <div className="h-72 w-full max-w-xs">
      <Select label="Role" options={roles} defaultValue="editor" description="Editors can change content." />
    </div>
  );
}
// #endregion

// #region Placeholder
export function Placeholder() {
  return (
    <div className="h-72 w-full max-w-xs">
      <Select label="Role" options={roles} placeholder="Choose a role" />
    </div>
  );
}
// #endregion

// #region WithError
export function WithError() {
  return (
    <div className="h-72 w-full max-w-xs">
      <Select label="Role" options={roles} error="Choose a role." />
    </div>
  );
}
// #endregion

// #region Disabled
export function Disabled() {
  return (
    <div className="w-full max-w-xs">
      <Select label="Role" options={roles} defaultValue="viewer" disabled />
    </div>
  );
}
// #endregion
