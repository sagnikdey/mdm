"use client";

import { useState } from "react";
import { Button, Gauge } from "@sagui/ui";

const storage = [
  { from: 0, tone: "success" as const, label: "Healthy" },
  { from: 70, tone: "warning" as const, label: "Filling up" },
  { from: 90, tone: "danger" as const, label: "Critical" },
];

// #region Hero
export function Hero() {
  return <Gauge label="Disk usage" value={72} detail="360 of 500 GB" thresholds={storage} />;
}
// #endregion

// #region Changing
export function Changing() {
  const [value, setValue] = useState(48);
  return (
    <div className="grid justify-items-center gap-4">
      <Gauge label="Disk usage" value={value} detail={`${value * 5} of 500 GB`} thresholds={storage} />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.max(0, v - 15))}>Free space</Button>
        <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.min(100, v + 15))}>Add files</Button>
      </div>
    </div>
  );
}
// #endregion

// #region Tones
export function Tones() {
  return (
    <div className="grid grid-cols-2 gap-8">
      <Gauge label="Build minutes" value={1240} max={2000} detail="1,240 of 2,000" />
      <Gauge label="Uptime" value={99} tone="success" detail="Last 30 days" />
    </div>
  );
}
// #endregion
