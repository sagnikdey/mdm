"use client";

import { useState } from "react";
import { RadioGroup } from "@sagui/ui";

// #region Hero
export function Hero() {
  const [value, setValue] = useState("mentions");
  return (
    <div className="w-full max-w-sm">
      <RadioGroup
        label="Notifications"
        value={value}
        onValueChange={setValue}
        options={[
          { value: "all", label: "All activity", description: "Every comment, edit and assignment." },
          { value: "mentions", label: "Mentions only", description: "Only when someone @mentions you." },
          { value: "none", label: "Nothing" },
        ]}
      />
    </div>
  );
}
// #endregion

// #region Uncontrolled
export function Uncontrolled() {
  return (
    <div className="w-full max-w-sm">
      <RadioGroup
        label="Billing"
        defaultValue="monthly"
        options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly", description: "Two months free." }]}
      />
    </div>
  );
}
// #endregion

// #region DisabledOption
export function DisabledOption() {
  return (
    <div className="w-full max-w-sm">
      <RadioGroup
        label="Plan"
        defaultValue="pro"
        options={[{ value: "pro", label: "Pro" }, { value: "team", label: "Team", disabled: true, description: "Contact sales to enable." }]}
      />
    </div>
  );
}
// #endregion
