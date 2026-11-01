"use client";

import { useState } from "react";
import { Checkbox } from "@sagui/ui";

// #region Hero
export function Hero() {
  return <Checkbox label="Email me product updates" description="At most one email a month." />;
}
// #endregion

// #region Checked
export function Checked() {
  return <Checkbox label="Remember this device" defaultChecked />;
}
// #endregion

// #region SelectAll
export function SelectAll() {
  const [items, setItems] = useState({ a: true, b: false, c: false });
  const values = Object.values(items);
  const all = values.every(Boolean);
  const some = values.some(Boolean);
  return (
    <div className="grid gap-1">
      <Checkbox
        label="Select all"
        checked={all ? true : some ? "indeterminate" : false}
        onCheckedChange={(next) => setItems({ a: next === true, b: next === true, c: next === true })}
      />
      <div className="ml-6 grid gap-1">
        {(["a", "b", "c"] as const).map((key) => (
          <Checkbox
            key={key}
            label={`Item ${key.toUpperCase()}`}
            checked={items[key]}
            onCheckedChange={(next) => setItems((last) => ({ ...last, [key]: next === true }))}
          />
        ))}
      </div>
    </div>
  );
}
// #endregion

// #region Disabled
export function Disabled() {
  return (
    <div className="grid gap-1">
      <Checkbox label="Unavailable" disabled />
      <Checkbox label="Locked on" disabled defaultChecked />
    </div>
  );
}
// #endregion
