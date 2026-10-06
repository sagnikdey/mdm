"use client";

import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button>Continue</Button>
      <Button variant="secondary">Save draft</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Skip</Button>
      <Button variant="danger">Delete</Button>
    </div>
  );
}
// #endregion

// #region Sizes
export function Sizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}
// #endregion

// #region WithIcons
export function WithIcons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button leadingIcon={<Plus />}>New project</Button>
      <Button variant="outline" trailingIcon={<ArrowRight />}>Continue</Button>
      <Button size="icon" variant="secondary" aria-label="Add"><Plus /></Button>
    </div>
  );
}
// #endregion

// #region LabelMorph
export function LabelMorph() {
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const label = { idle: "Save changes", saving: "Saving", saved: "Saved" }[state];
  return (
    <Button
      loading={state === "saving"}
      variant={state === "saved" ? "secondary" : "primary"}
      onClick={() => {
        setState("saving");
        setTimeout(() => setState("saved"), 1200);
        setTimeout(() => setState("idle"), 2600);
      }}
    >
      {label}
    </Button>
  );
}
// #endregion

// #region AsLink
export function AsLink() {
  return (
    <Button asChild variant="outline">
      <a href="/components">Browse components</a>
    </Button>
  );
}
// #endregion

// #region Disabled
export function Disabled() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button disabled>Primary</Button>
      <Button variant="outline" disabled>Outline</Button>
    </div>
  );
}
// #endregion
