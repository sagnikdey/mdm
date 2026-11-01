"use client";

import { useState } from "react";
import { SegmentedControl, WaffleChart } from "@sagui/ui";
import { powerMix2015, powerMix2023 } from "./sample-data";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-xl">
      <WaffleChart data={powerMix2023} label="Electricity generation, 2023" unit="TWh" />
    </div>
  );
}
// #endregion

// #region Years
export function Years() {
  const [year, setYear] = useState("2023");
  return (
    <div className="grid w-full max-w-xl gap-4">
      <SegmentedControl label="Year" value={year} onValueChange={setYear} options={[{ value: "2015", label: "2015" }, { value: "2023", label: "2023" }]} />
      <WaffleChart data={year === "2023" ? powerMix2023 : powerMix2015} label={`Electricity generation, ${year}`} unit="TWh" />
    </div>
  );
}
// #endregion
