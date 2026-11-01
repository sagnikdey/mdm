"use client";

import { Trash2 } from "lucide-react";
import { ConfirmMorph } from "@sagui/ui";

// #region Hero
export function Hero() {
  const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  return <ConfirmMorph label="Delete" icon={<Trash2 />} prompt="Delete 3 files?" onConfirm={() => wait(900)} onUndo={() => wait(600)} />;
}
// #endregion

// #region Neutral
export function Neutral() {
  const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  return (
    <ConfirmMorph
      tone="neutral"
      label="Discard draft"
      prompt="Discard this draft?"
      confirmLabel="Discard"
      pendingLabel="Discarding"
      doneLabel="Discarded"
      onConfirm={() => wait(700)}
    />
  );
}
// #endregion

// #region FailsThenRetries
export function FailsThenRetries() {
  const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  return (
    <ConfirmMorph
      label="Revoke access"
      prompt="Revoke access?"
      confirmLabel="Revoke"
      pendingLabel="Revoking"
      doneLabel="Revoked"
      onConfirm={async () => { await wait(700); throw new Error("Network down"); }}
    />
  );
}
// #endregion

// #region Disabled
export function Disabled() {
  return <ConfirmMorph disabled label="Delete" />;
}
// #endregion
