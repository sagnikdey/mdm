"use client";

import { useState } from "react";
import { DonutChart, SegmentedControl } from "@sagui/ui";
import { trafficLastMonth, trafficThisMonth } from "./sample-data";

// #region Hero
export function Hero() {
  return <DonutChart label="Visits by source" unit="visits" data={trafficThisMonth} />;
}
// #endregion

// #region Morph
export function Morph() {
  const [month, setMonth] = useState("september");
  return (
    <div className="grid justify-items-center gap-5">
      <SegmentedControl label="Month" value={month} onValueChange={setMonth} options={[{ value: "august", label: "August" }, { value: "september", label: "September" }]} />
      <DonutChart label="Visits by source" unit="visits" data={month === "september" ? trafficThisMonth : trafficLastMonth} />
    </div>
  );
}
// #endregion

// #region Select
export function Select() {
  return <DonutChart label="Visits by source" unit="visits" data={trafficThisMonth} legendAction="select" defaultActiveKey="search" size={180} thickness={20} />;
}
// #endregion
