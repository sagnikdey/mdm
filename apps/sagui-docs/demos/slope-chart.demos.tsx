"use client";

import { useState } from "react";
import { SegmentedControl, SlopeChart } from "@sagui/ui";
import { channelsQ2, channelsQ3 } from "./sample-data";

const percent = (value: number) => `${value.toFixed(1)}%`;

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-lg">
      <SlopeChart data={channelsQ2} label="Conversion by channel" startLabel="Q1" endLabel="Q2" highlightKey="email" formatValue={percent} />
    </div>
  );
}
// #endregion

// #region Quarters
export function Quarters() {
  const [quarter, setQuarter] = useState("q2");
  return (
    <div className="grid w-full max-w-lg gap-4">
      <SegmentedControl label="Quarter" value={quarter} onValueChange={setQuarter} options={[{ value: "q2", label: "Q1 → Q2" }, { value: "q3", label: "Q2 → Q3" }]} />
      <SlopeChart
        data={quarter === "q2" ? channelsQ2 : channelsQ3}
        label="Conversion by channel"
        startLabel={quarter === "q2" ? "Q1" : "Q2"}
        endLabel={quarter === "q2" ? "Q2" : "Q3"}
        formatValue={percent}
        formatChange={(change) => `${change > 0 ? "+" : ""}${change.toFixed(1)} pts`}
      />
    </div>
  );
}
// #endregion
