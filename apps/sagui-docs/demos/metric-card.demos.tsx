"use client";

import { useState } from "react";
import { Button, MetricCard } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-xs">
      <MetricCard label="Active users" value={12840} change="+12.4%" context="Compared with last week" />
    </div>
  );
}
// #endregion

// #region Down
export function Down() {
  return (
    <div className="w-full max-w-xs">
      <MetricCard label="Churn" value={3.2} decimals={1} suffix="%" change="-0.8%" context="Lower is better" />
    </div>
  );
}
// #endregion

// #region Money
export function Money() {
  return (
    <div className="w-full max-w-xs">
      <MetricCard label="Revenue" value={48250} prefix="$" context="Last 30 days" />
    </div>
  );
}
// #endregion

// #region Live
export function Live() {
  const periods = [
    { value: 12840, change: "+12.4%", context: "This week" },
    { value: 9120, change: "-8.1%", context: "Last week" },
    { value: 15300, change: "+19.2%", context: "Two weeks ago" },
  ];
  const [step, setStep] = useState(0);
  const current = periods[step % periods.length];
  return (
    <div className="grid w-full max-w-xs gap-3">
      <MetricCard label="Active users" value={current.value} change={current.change} context={current.context} />
      <Button variant="outline" size="sm" onClick={() => setStep((value) => value + 1)}>Next period</Button>
    </div>
  );
}
// #endregion
