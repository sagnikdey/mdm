"use client";

import { Treemap } from "@sagui/ui";
import { revenueByRegion } from "./sample-data";

const dollars = (value: number) => `$${(value / 1000).toFixed(1)}M`;

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-3xl">
      <Treemap data={revenueByRegion} label="Annual recurring revenue" formatValue={dollars} colorLabel="Growth" formatColor={(value) => `+${value}%`} />
    </div>
  );
}
// #endregion

// #region Focused
export function Focused() {
  return (
    <div className="w-full max-w-3xl">
      <Treemap data={revenueByRegion} label="Annual recurring revenue" formatValue={dollars} defaultFocus="eu" height={320} />
    </div>
  );
}
// #endregion
