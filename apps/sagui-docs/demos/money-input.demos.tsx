"use client";

import { useState } from "react";
import { MoneyInput } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-md">
      <MoneyInput label="Amount" defaultValue={12500} />
    </div>
  );
}
// #endregion

// #region MinorUnits
export function MinorUnits() {
  const [cents, setCents] = useState<number | null>(1250);
  return (
    <div className="grid w-full max-w-md gap-3">
      <MoneyInput label="Amount" value={cents} onValueChange={setCents} quickAdd={[]} />
      <code className="text-xs text-muted-foreground">value = {String(cents)}</code>
    </div>
  );
}
// #endregion

// #region WithLimits
export function WithLimits() {
  return (
    <div className="w-full max-w-md">
      <MoneyInput label="Transfer" min={500} max={100000} defaultValue={2500} description="Per transfer." />
    </div>
  );
}
// #endregion

// #region Euro
export function Euro() {
  return (
    <div className="w-full max-w-md">
      <MoneyInput label="Betrag" defaultCurrency="EUR" locale="de-DE" defaultValue={129900} />
    </div>
  );
}
// #endregion

// #region Yen
export function Yen() {
  return (
    <div className="w-full max-w-md">
      <MoneyInput label="Amount" defaultCurrency="JPY" defaultValue={4800} />
    </div>
  );
}
// #endregion
