"use client";

import { useState } from "react";
import { Input } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-sm">
      <Input label="Project name" placeholder="Untitled project" description="Shown on invoices and in the sidebar." />
    </div>
  );
}
// #endregion

// #region Validation
export function Validation() {
  const [email, setEmail] = useState("");
  return (
    <div className="w-full max-w-sm">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        description="We only use this for receipts."
        error={email && !email.includes("@") ? "Enter a valid email" : undefined}
      />
    </div>
  );
}
// #endregion

// #region LiveCount
export function LiveCount() {
  const [bio, setBio] = useState("");
  return (
    <div className="w-full max-w-sm">
      <Input
        label="Short bio"
        value={bio}
        onChange={(event) => setBio(event.target.value)}
        description={`${bio.length} characters`}
        error={bio.length > 20 ? "Keep it under 20 characters." : undefined}
      />
    </div>
  );
}
// #endregion

// #region Disabled
export function Disabled() {
  return (
    <div className="w-full max-w-sm">
      <Input label="Workspace" disabled defaultValue="Atlas" description="Only owners can rename the workspace." />
    </div>
  );
}
// #endregion
