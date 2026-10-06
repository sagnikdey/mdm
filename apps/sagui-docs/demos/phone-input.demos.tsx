"use client";

import { useState } from "react";
import { PhoneInput } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="h-[380px] w-full max-w-sm">
      <PhoneInput label="Phone number" description="We only use this for sign-in codes." />
    </div>
  );
}
// #endregion

// #region E164
export function E164() {
  const [value, setValue] = useState("");
  return (
    <div className="grid h-[380px] w-full max-w-sm content-start gap-3">
      <PhoneInput label="Phone number" onValueChange={setValue} />
      <code className="text-xs text-muted-foreground">e164 = {value || "(empty)"}</code>
    </div>
  );
}
// #endregion

// #region Prefilled
export function Prefilled() {
  return (
    <div className="h-[380px] w-full max-w-sm">
      <PhoneInput label="Phone number" defaultValue="+447400123456" />
    </div>
  );
}
// #endregion

// #region LimitedCountries
export function LimitedCountries() {
  return (
    <div className="h-[380px] w-full max-w-sm">
      <PhoneInput label="Phone number" countries={["US", "CA", "MX"]} preferredCountries={["US"]} />
    </div>
  );
}
// #endregion
