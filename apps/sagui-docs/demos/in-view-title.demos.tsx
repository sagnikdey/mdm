"use client";

import { useState } from "react";
import { InViewTitle, SegmentedControl, type InViewTitleVariant } from "@sagui/ui";

// #region Hero
export function Hero() {
  return <InViewTitle className="text-4xl font-semibold tracking-tight" text="Make every word count" />;
}
// #endregion

// #region Variants
const variants: InViewTitleVariant[] = ["blur", "word", "line", "tracking", "wipe"];
export function Variants() {
  const [variant, setVariant] = useState<InViewTitleVariant>("word");
  return (
    <div className="grid justify-items-center gap-6 text-center">
      <SegmentedControl label="Variant" value={variant} onValueChange={(value) => setVariant(value as InViewTitleVariant)} options={variants.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} />
      <InViewTitle key={variant} variant={variant} className="text-4xl font-semibold tracking-tight" text="Everything your team needs to ship" lines={["Everything your team", "needs to ship"]} />
    </div>
  );
}
// #endregion
