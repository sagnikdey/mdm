"use client";

import { useState } from "react";
import { MorphSelect } from "@sagui/ui";

const zones = ["Pacific", "Mountain", "Central", "Eastern", "Atlantic", "UTC", "London", "Paris", "Berlin", "Cairo", "Dubai", "Mumbai", "Singapore", "Tokyo", "Sydney"].map((name, index) => ({
  value: name.toLowerCase(),
  label: name,
  meta: `UTC${index < 5 ? "-" : "+"}${(index % 8) + 1}`,
}));

// #region Hero
export function Hero() {
  const [zone, setZone] = useState<string | null>("london");
  return (
    <div className="h-[400px] w-full max-w-xs">
      <MorphSelect label="Time zone" items={zones} value={zone} onValueChange={setZone} />
    </div>
  );
}
// #endregion

// #region Grouped
export function Grouped() {
  return (
    <div className="h-[300px] w-full max-w-xs">
      <MorphSelect
        label="Produce"
        placeholder="Pick one"
        items={[
          { label: "Fruit", options: [{ value: "apple", label: "Apple" }, { value: "pear", label: "Pear" }] },
          { label: "Vegetables", options: [{ value: "leek", label: "Leek" }, { value: "kale", label: "Kale" }] },
        ]}
      />
    </div>
  );
}
// #endregion

// #region AlignEnd
export function AlignEnd() {
  return (
    <div className="flex h-[400px] w-full max-w-xs justify-end">
      <MorphSelect label="Time zone" items={zones} defaultValue="tokyo" align="end" />
    </div>
  );
}
// #endregion
