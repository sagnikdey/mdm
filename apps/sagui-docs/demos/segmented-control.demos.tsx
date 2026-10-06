"use client";

import { useState } from "react";
import { SegmentedControl } from "@sagui/ui";

// #region Hero
export function Hero() {
  const [view, setView] = useState("board");
  return (
    <SegmentedControl
      label="View"
      value={view}
      onValueChange={setView}
      options={[{ value: "list", label: "List" }, { value: "board", label: "Board" }, { value: "timeline", label: "Timeline" }]}
    />
  );
}
// #endregion

// #region WithAccessory
export function WithAccessory() {
  return (
    <SegmentedControl
      label="Status"
      defaultValue="all"
      options={[
        { value: "all", label: "All", accessory: <span className="text-xs text-muted-foreground">24</span> },
        { value: "open", label: "Open", accessory: <span className="text-xs text-muted-foreground">9</span> },
        { value: "closed", label: "Closed" },
      ]}
    />
  );
}
// #endregion

// #region Overflowing
export function Overflowing() {
  return (
    <div className="w-64">
      <SegmentedControl
        label="Range"
        defaultValue="day"
        options={["Day", "Week", "Month", "Quarter", "Year", "All time"].map((label) => ({ value: label.toLowerCase(), label }))}
      />
    </div>
  );
}
// #endregion
