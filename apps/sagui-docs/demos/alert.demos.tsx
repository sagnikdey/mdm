"use client";

import { useState } from "react";
import { Alert, Button } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-md">
      <Alert title="Your trial ends in 3 days">Add a payment method to keep your projects.</Alert>
    </div>
  );
}
// #endregion

// #region Tones
export function Tones() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Alert tone="info" title="Heads up">A new version is available.</Alert>
      <Alert tone="success" title="Changes published">Everyone with the link can see them.</Alert>
      <Alert tone="warning" title="Storage almost full">You have used 92% of your 10 GB.</Alert>
      <Alert tone="danger" title="Payment failed">Your card was declined.</Alert>
    </div>
  );
}
// #endregion

// #region Dismissible
export function Dismissible() {
  const [open, setOpen] = useState(true);
  return (
    <div className="grid w-full max-w-md gap-3">
      <Alert open={open} onDismiss={() => setOpen(false)} tone="warning" title="Unsaved changes">You have edits that are not published.</Alert>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={open}>Show again</Button>
    </div>
  );
}
// #endregion

// #region Rewording
export function Rewording() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="grid w-full max-w-md gap-3">
      <Alert tone={saved ? "success" : "info"} title={saved ? "All changes saved" : "Saving your work"}>
        {saved ? "You can close this tab." : "This takes a moment."}
      </Alert>
      <Button variant="outline" size="sm" onClick={() => setSaved((value) => !value)}>Toggle state</Button>
    </div>
  );
}
// #endregion
