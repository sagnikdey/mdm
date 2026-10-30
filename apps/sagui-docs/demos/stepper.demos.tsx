"use client";

import { Stepper } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="w-64">
      <Stepper
        current={2}
        steps={[{ label: "Company profile" }, { label: "Contacts" }, { label: "Addresses" }, { label: "Banking" }, { label: "Review and submit" }]}
      />
    </div>
  );
}
// #endregion

// #region WithError
export function WithError() {
  return (
    <div className="w-64">
      <Stepper
        current={3}
        steps={[{ label: "Company profile" }, { label: "Contacts", error: true }, { label: "Addresses" }, { label: "Banking" }, { label: "Review and submit" }]}
      />
    </div>
  );
}
// #endregion
