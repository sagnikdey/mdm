"use client";

import { useState } from "react";
import { Button, TextShimmer } from "@sagui/ui";

// #region Hero
export function Hero() {
  return <TextShimmer>Generating summary</TextShimmer>;
}
// #endregion

// #region Finishing
export function Finishing() {
  const [busy, setBusy] = useState(true);
  return (
    <div className="grid justify-items-center gap-4">
      <TextShimmer active={busy}>{busy ? "Generating summary" : "Summary ready"}</TextShimmer>
      <Button size="sm" variant="outline" onClick={() => setBusy((value) => !value)}>{busy ? "Finish" : "Start again"}</Button>
    </div>
  );
}
// #endregion

// #region Large
export function Large() {
  return <TextShimmer as="h3" duration={2.6} className="text-2xl font-semibold tracking-tight">Thinking about your question</TextShimmer>;
}
// #endregion
