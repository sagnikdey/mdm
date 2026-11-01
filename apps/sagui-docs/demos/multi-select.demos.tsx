"use client";

import { MultiSelect } from "@sagui/ui";

const teams = [
  { value: "design", label: "Design" },
  { value: "eng", label: "Engineering" },
  { value: "product", label: "Product" },
  { value: "support", label: "Support" },
  { value: "finance", label: "Finance", disabled: true },
];

// #region Hero
export function Hero() {
  return (
    <div className="h-72 w-full max-w-xs">
      <MultiSelect label="Teams" options={teams} defaultValue={["design", "eng"]} />
    </div>
  );
}
// #endregion

// #region ManySelected
export function ManySelected() {
  return (
    <div className="h-72 w-full max-w-xs">
      <MultiSelect label="Teams" options={teams} defaultValue={["design", "eng", "product", "support"]} />
    </div>
  );
}
// #endregion

// #region WithError
export function WithError() {
  return (
    <div className="h-72 w-full max-w-xs">
      <MultiSelect label="Teams" options={teams} error="Pick at least one team." />
    </div>
  );
}
// #endregion
