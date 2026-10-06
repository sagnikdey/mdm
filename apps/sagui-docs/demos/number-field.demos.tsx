"use client";

import { useState } from "react";
import { NumberField } from "@sagui/ui";

// #region Hero
export function Hero() {
  const [seats, setSeats] = useState(5);
  return (
    <NumberField
      label="Seats"
      value={seats}
      onValueChange={setSeats}
      min={1}
      max={10}
      suffix={(n) => (n === 1 ? " seat" : " seats")}
      scrub
      description="Drag the label to scrub."
    />
  );
}
// #endregion

// #region Currency
export function Currency() {
  return <NumberField label="Budget" prefix="$" min={0} max={5000} step={25} defaultValue={400} />;
}
// #endregion

// #region Decimals
export function Decimals() {
  return <NumberField label="Opacity" min={0} max={1} step={0.05} defaultValue={0.5} />;
}
// #endregion

// #region Sizes
export function Sizes() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-6">
      <NumberField size="sm" label="Small" defaultValue={3} min={0} max={20} />
      <NumberField size="md" label="Medium" defaultValue={3} min={0} max={20} />
      <NumberField size="lg" label="Large" defaultValue={3} min={0} max={20} />
    </div>
  );
}
// #endregion

// #region Disabled
export function Disabled() {
  return <NumberField disabled label="Seats" defaultValue={5} min={1} max={10} />;
}
// #endregion
