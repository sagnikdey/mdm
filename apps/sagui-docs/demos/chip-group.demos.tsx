"use client";

import { useState } from "react";
import { ChipGroup } from "@sagui/ui";

const topics = ["Design", "Motion", "Tokens", "Accessibility", "React", "Storybook", "Typography", "Layout", "Color", "Forms"].map((label) => ({ value: label.toLowerCase(), label }));

// #region Hero
export function Hero() {
  const [selected, setSelected] = useState(["design"]);
  return (
    <div className="w-full max-w-md">
      <ChipGroup label="Topics" options={topics.slice(0, 5)} value={selected} onValueChange={setSelected} />
    </div>
  );
}
// #endregion

// #region Single
export function Single() {
  return (
    <div className="w-full max-w-md">
      <ChipGroup label="Status" multiple={false} defaultValue={["open"]} options={[{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }, { value: "draft", label: "Draft" }]} />
    </div>
  );
}
// #endregion

// #region Folded
export function Folded() {
  return (
    <div className="w-full max-w-md">
      <ChipGroup label="Topics" options={topics} maxVisible={4} defaultValue={["design"]} />
    </div>
  );
}
// #endregion
