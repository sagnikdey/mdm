"use client";

import { ActionButton } from "@sagui/ui";

// #region Hero
export function Hero() {
  const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  return <ActionButton label="Publish" pendingLabel="Publishing" successLabel="Published" onAction={() => wait(1200)} />;
}
// #endregion

// #region Save
export function Save() {
  const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  return <ActionButton label="Save changes" onAction={() => wait(900)} />;
}
// #endregion

// #region StaysOnSuccess
export function StaysOnSuccess() {
  const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  return <ActionButton label="Submit" pendingLabel="Submitting" successLabel="Submitted" resetAfterMs={0} onAction={() => wait(900)} />;
}
// #endregion

// #region WithError
export function WithError() {
  const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  return (
    <ActionButton
      label="Sync now"
      pendingLabel="Syncing"
      successLabel="Synced"
      onAction={async () => { await wait(900); throw new Error("Offline"); }}
      onActionError={(error) => console.warn(String(error))}
    />
  );
}
// #endregion
