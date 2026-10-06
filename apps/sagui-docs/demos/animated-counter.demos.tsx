"use client";

import { useState } from "react";
import { AnimatedCounter, Button } from "@sagui/ui";

// #region Hero
export function Hero() {
  const [value, setValue] = useState(1280);
  return (
    <div className="grid justify-items-center gap-5">
      <AnimatedCounter label="Orders" value={value} />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setValue((v) => v + 487)}>Add</Button>
        <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.max(0, v - 1000))}>Subtract</Button>
      </div>
    </div>
  );
}
// #endregion

// #region Money
export function Money() {
  return <AnimatedCounter label="Balance" value={4820.5} prefix="$" decimals={2} animateOnView />;
}
// #endregion

// #region Percent
export function Percent() {
  return <AnimatedCounter value={98.6} suffix="%" decimals={1} animateOnView />;
}
// #endregion
