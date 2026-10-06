"use client";

import { useState } from "react";
import { LineChart, SegmentedControl, type LineChartDatum } from "@sagui/ui";
import { signups, signupSeries } from "./sample-data";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-2xl">
      <LineChart label="Signups" data={signups(30)} series={signupSeries} />
    </div>
  );
}
// #endregion

// #region Ranges
const ranges = { "7": signups(7), "30": signups(30), "90": signups(90) };
export function Ranges() {
  const [range, setRange] = useState<keyof typeof ranges>("30");
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <SegmentedControl label="Range" value={range} onValueChange={(value) => setRange(value as keyof typeof ranges)} options={[{ value: "7", label: "7 days" }, { value: "30", label: "30 days" }, { value: "90", label: "90 days" }]} />
      <LineChart label="Signups" data={ranges[range]} series={signupSeries} />
    </div>
  );
}
// #endregion

// #region Readout
export function Readout() {
  const data = signups(30);
  const [active, setActive] = useState<LineChartDatum | null>(null);
  const shown = active ?? data[data.length - 1];
  return (
    <div className="grid w-full max-w-2xl gap-2">
      <p className="text-sm text-muted-foreground">{shown.label}</p>
      <p className="text-3xl font-semibold tabular-nums">{shown.values.signups} signups</p>
      <LineChart label="Signups" data={data} series={signupSeries} onActiveChange={(_, datum) => setActive(datum)} />
    </div>
  );
}
// #endregion

// #region Linear
export function Linear() {
  return (
    <div className="w-full max-w-2xl">
      <LineChart label="Response time" unit="ms" curve="linear" height={180} data={signups(14, 21)} series={[{ key: "signups", label: "p95 latency" }]} />
    </div>
  );
}
// #endregion
