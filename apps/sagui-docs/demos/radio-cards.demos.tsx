"use client";

import { useState } from "react";
import { Building2, Rocket, Sprout } from "lucide-react";
import { RadioCards } from "@sagui/ui";

// #region Hero
export function Hero() {
  const [plan, setPlan] = useState("pro");
  return (
    <div className="w-full max-w-2xl">
      <RadioCards
        aria-label="Plan"
        value={plan}
        onValueChange={setPlan}
        options={[
          { value: "free", label: "Starter", description: "For trying things out.", meta: "$0", icon: <Sprout /> },
          { value: "pro", label: "Pro", description: "For teams that ship weekly.", meta: "$12", icon: <Rocket /> },
          { value: "enterprise", label: "Enterprise", description: "Custom limits and support.", meta: "Talk to us", icon: <Building2 />, disabled: true, disabledReason: "Contact sales to enable." },
        ]}
      />
    </div>
  );
}
// #endregion

// #region List
export function List() {
  return (
    <div className="w-full max-w-md">
      <RadioCards
        aria-label="Shipping"
        layout="list"
        defaultValue="standard"
        options={[
          { value: "standard", label: "Standard", description: "3 to 5 business days", meta: "Free" },
          { value: "express", label: "Express", description: "Next business day", meta: "$14" },
        ]}
      />
    </div>
  );
}
// #endregion
