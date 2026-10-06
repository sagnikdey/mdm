"use client";

import { useState } from "react";
import { SegmentedControl, Streamgraph } from "@sagui/ui";
import { ticketTopics, tickets } from "./sample-data";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-2xl">
      <Streamgraph data={tickets(26)} series={ticketTopics} label="Support tickets by topic" unit="tickets" categoryLabel="Week" />
    </div>
  );
}
// #endregion

// #region Offsets
export function Offsets() {
  const [offset, setOffset] = useState<"wiggle" | "silhouette" | "zero">("zero");
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <SegmentedControl label="Baseline" value={offset} onValueChange={(value) => setOffset(value as typeof offset)} options={[{ value: "wiggle", label: "Wiggle" }, { value: "silhouette", label: "Silhouette" }, { value: "zero", label: "Zero" }]} />
      <Streamgraph data={tickets(26)} series={ticketTopics} label="Support tickets by topic" unit="tickets" categoryLabel="Week" offset={offset} height={220} />
    </div>
  );
}
// #endregion
