"use client";

import { useState } from "react";
import { Button, Toast } from "@sagui/ui";

// #region Hero
export function Hero() {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid w-full place-items-center gap-5">
      <Button onClick={() => setOpen(true)} disabled={open}>Save project</Button>
      <div className="flex h-24 w-full items-end justify-center">
        <Toast open={open} onOpenChange={setOpen} title="Project saved" description="Closes itself, or swipe it away." />
      </div>
    </div>
  );
}
// #endregion

// #region TitleOnly
export function TitleOnly() {
  return <Toast title="Link copied" />;
}
// #endregion

// #region Morphing
export function Morphing() {
  const [done, setDone] = useState(false);
  return (
    <div className="grid w-full place-items-center gap-5">
      <Toast title={done ? "Upload complete" : "Uploading"} description={done ? "3 files are ready to share." : "This takes a few seconds."} />
      <Button variant="outline" size="sm" onClick={() => setDone((value) => !value)}>Toggle state</Button>
    </div>
  );
}
// #endregion
