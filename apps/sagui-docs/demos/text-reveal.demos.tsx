"use client";

import { useState } from "react";
import { Button, TextReveal } from "@sagui/ui";

// #region Hero
export function Hero() {
  return <TextReveal as="h2" className="text-4xl font-semibold tracking-tight" text={"Ship interfaces\nthat feel precise"} />;
}
// #endregion

// #region Replay
export function Replay() {
  const [run, setRun] = useState(0);
  return (
    <div className="grid justify-items-center gap-6 text-center">
      <TextReveal key={run} as="p" className="max-w-md text-lg text-muted-foreground" text="Each word rises out of its own clip while it sharpens from a soft blur." delay={0.1} />
      <Button size="sm" variant="outline" onClick={() => setRun((value) => value + 1)}>Replay</Button>
    </div>
  );
}
// #endregion
