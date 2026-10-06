"use client";

import { Avatar } from "@sagui/ui";

const photo =
  "data:image/svg+xml;utf8," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#7c9cf0"/><circle cx="32" cy="26" r="12" fill="#fff"/><path d="M10 64c2-16 14-22 22-22s20 6 22 22z" fill="#fff"/></svg>');

// #region Hero
export function Hero() {
  return <Avatar name="Maya Chen" status="online" />;
}
// #endregion

// #region Sizes
export function Sizes() {
  return (
    <div className="flex items-end gap-3">
      <Avatar name="Maya Chen" size="sm" />
      <Avatar name="Maya Chen" size="md" />
      <Avatar name="Maya Chen" size="lg" />
      <Avatar name="Maya Chen" size="xl" />
    </div>
  );
}
// #endregion

// #region Photo
export function Photo() {
  return (
    <div className="flex items-center gap-3">
      <Avatar name="Maya Chen" src={photo} size="lg" />
      <Avatar name="Sam Ortiz" src="/does-not-exist.png" size="lg" />
    </div>
  );
}
// #endregion

// #region Status
export function Status() {
  return (
    <div className="flex items-center gap-3">
      <Avatar name="Maya Chen" status="online" size="lg" />
      <Avatar name="Sam Ortiz" status="offline" size="lg" />
    </div>
  );
}
// #endregion
