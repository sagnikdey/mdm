"use client";

import { useState } from "react";
import { BrushChart } from "@sagui/ui";
import { dailyActiveUsers, launches } from "./sample-data";

const days = dailyActiveUsers();

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-3xl">
      <BrushChart data={days} label="Daily active users" unit="users" annotations={launches} defaultRange={[days[days.length - 90].date as number, days[days.length - 1].date as number]} />
    </div>
  );
}
// #endregion

// #region Controlled
export function Controlled() {
  const [range, setRange] = useState<[number, number]>([days[days.length - 30].date as number, days[days.length - 1].date as number]);
  const format = (time: number) => new Date(time).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return (
    <div className="grid w-full max-w-3xl gap-3">
      <p className="text-sm text-muted-foreground">Showing {format(range[0])} to {format(range[1])}</p>
      <BrushChart data={days} label="Daily active users" unit="users" range={range} onRangeChange={setRange} height={200} />
    </div>
  );
}
// #endregion
