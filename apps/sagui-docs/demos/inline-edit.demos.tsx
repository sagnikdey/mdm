"use client";

import { useState } from "react";
import { InlineEdit } from "@sagui/ui";

// #region Hero
export function Hero() {
  const [name, setName] = useState("Atlas redesign");
  const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  return (
    <InlineEdit
      as="h2"
      label="Project name"
      value={name}
      onSave={async (next) => { await wait(700); setName(next); }}
    />
  );
}
// #endregion

// #region Body
export function Body() {
  const [text, setText] = useState("A quiet redesign of the workspace home.");
  return (
    <InlineEdit
      variant="body"
      label="Description"
      placeholder="Add a description"
      value={text}
      onSave={(next) => setText(next)}
    />
  );
}
// #endregion

// #region Multiline
export function Multiline() {
  const [notes, setNotes] = useState("Notes for the team.\nWrap onto more lines as you type.");
  return (
    <div className="w-full max-w-md">
      <InlineEdit variant="body" multiline label="Notes" value={notes} onSave={(next) => setNotes(next)} />
    </div>
  );
}
// #endregion

// #region Validated
export function Validated() {
  const [name, setName] = useState("Atlas");
  return (
    <InlineEdit
      label="Project name"
      value={name}
      validate={(next) => (next.length < 3 ? "Use at least 3 characters." : null)}
      onSave={(next) => setName(next)}
    />
  );
}
// #endregion

// #region SaveFails
export function SaveFails() {
  const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  return (
    <div className="w-full max-w-md">
      <InlineEdit
        label="Project name"
        value="Atlas"
        onSave={async () => { await wait(700); throw new Error("offline"); }}
      />
    </div>
  );
}
// #endregion
