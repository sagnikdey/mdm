"use client";

import { useState } from "react";
import { ActivityHeatmap } from "@sagui/ui";
import { contributions } from "./sample-data";

const days = contributions();

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-3xl">
      <ActivityHeatmap days={days} label="Contributions in 2026" period="2026" />
    </div>
  );
}
// #endregion

// #region Selectable
export function Selectable() {
  const [selected, setSelected] = useState<string | null>(null);
  const count = days.find((day) => day.date === selected)?.count ?? 0;
  return (
    <div className="grid w-full max-w-3xl gap-3">
      <ActivityHeatmap days={days} label="Deploys in 2026" period="2026" unit={{ one: "deploy", other: "deploys" }} weekStartsOn={1} selectedDate={selected} onSelectDate={setSelected} />
      <p className="text-sm text-muted-foreground">{selected ? `${selected}: ${count} deploys` : "Pick a day to see its deploys."}</p>
    </div>
  );
}
// #endregion
