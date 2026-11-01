"use client";

import { useState } from "react";
import { Button, PasswordStrength, type PasswordStrengthResult } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-sm">
      <PasswordStrength label="New password" />
    </div>
  );
}
// #endregion

// #region CustomRules
export function CustomRules() {
  return (
    <div className="w-full max-w-sm">
      <PasswordStrength
        label="New password"
        rules={[
          { id: "length", label: "At least 10 characters", test: (p) => p.length >= 10, remaining: (p) => Math.max(0, 10 - p.length) },
          { id: "digit", label: "Contains a digit", test: (p) => /\d/.test(p) },
        ]}
      />
    </div>
  );
}
// #endregion

// #region GateSubmit
export function GateSubmit() {
  const [strength, setStrength] = useState<PasswordStrengthResult | null>(null);
  const ok = (strength?.level ?? 0) >= 3;
  return (
    <div className="grid w-full max-w-sm gap-4">
      <PasswordStrength label="New password" onValueChange={(_, result) => setStrength(result)} />
      <Button disabled={!ok}>Create account</Button>
    </div>
  );
}
// #endregion

// #region WithError
export function WithError() {
  return (
    <div className="w-full max-w-sm">
      <PasswordStrength label="New password" error="This password appeared in a data breach." />
    </div>
  );
}
// #endregion
