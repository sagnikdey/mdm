"use client";

import { useState } from "react";
import { BarChart, SegmentedControl } from "@sagui/ui";
import { activeMinutes } from "./sample-data";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-md">
      <BarChart data={activeMinutes(7)} label="Active minutes" period="Sep 15–21, 2026" unit="min" />
    </div>
  );
}
// #endregion

// #region Ranges
export function Ranges() {
  const [days, setDays] = useState<"7" | "14">("7");
  return (
    <div className="grid w-full max-w-md gap-4">
      <SegmentedControl label="Range" value={days} onValueChange={(value) => setDays(value as "7" | "14")} options={[{ value: "7", label: "Week" }, { value: "14", label: "Two weeks" }]} />
      <BarChart data={activeMinutes(days === "7" ? 7 : 14)} label="Active minutes" period={days === "7" ? "Sep 15–21, 2026" : "Sep 8–21, 2026"} unit="min" />
    </div>
  );
}
// #endregion

// #region NoAverage
export function NoAverage() {
  return (
    <div className="w-full max-w-md">
      <BarChart data={activeMinutes(7, 9)} label="Orders" period="This week" showAverage={false} averageLabel="Average" valueLabel="Orders" />
    </div>
  );
}
// #endregion
