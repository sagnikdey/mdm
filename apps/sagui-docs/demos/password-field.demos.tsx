"use client";

import { PasswordField } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-sm">
      <PasswordField label="Password" autoComplete="current-password" />
    </div>
  );
}
// #endregion

// #region WithDescription
export function WithDescription() {
  return (
    <div className="w-full max-w-sm">
      <PasswordField label="Password" description="Use the password from your last sign in." />
    </div>
  );
}
// #endregion

// #region WithError
export function WithError() {
  return (
    <div className="w-full max-w-sm">
      <PasswordField label="Password" error="That password isn't right." />
    </div>
  );
}
// #endregion
