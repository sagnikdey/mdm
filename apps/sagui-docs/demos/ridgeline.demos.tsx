"use client";

import { Ridgeline } from "@sagui/ui";
import { latency } from "./sample-data";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-2xl">
      <Ridgeline series={latency()} label="API latency by region" unit=" ms" />
    </div>
  );
}
// #endregion

// #region Untinted
export function Untinted() {
  return (
    <div className="w-full max-w-2xl">
      <Ridgeline series={latency(23).slice(0, 4)} label="API latency by region" unit=" ms" tint={false} overlap={1.6} rowHeight={36} />
    </div>
  );
}
// #endregion
