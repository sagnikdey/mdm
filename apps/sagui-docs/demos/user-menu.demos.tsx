"use client";

import { useState } from "react";
import { CreditCard, Settings, UserRound } from "lucide-react";
import { UserMenu, type ThemePreference, type UserStatus } from "@sagui/ui";

const avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&q=80&auto=format&fit=crop&crop=faces";
const items = [
  { label: "Profile", icon: <UserRound /> },
  { label: "Billing", icon: <CreditCard /> },
  { label: "Settings", icon: <Settings />, keys: ["⌘", ","] },
];
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// #region Hero
export function Hero() {
  return <UserMenu user={{ name: "Maya Chen", email: "maya@example.com", plan: "Pro", avatarSrc: avatar }} items={items} onSignOut={() => wait(900)} />;
}
// #endregion

// #region WithName
export function WithName() {
  return <UserMenu showName user={{ name: "Maya Chen", email: "maya@example.com", avatarSrc: avatar }} items={items} onSignOut={() => {}} />;
}
// #endregion

// #region Status
export function Status() {
  const [status, setStatus] = useState<UserStatus>("busy");
  const [theme, setTheme] = useState<ThemePreference>("system");
  return (
    <div className="grid justify-items-center gap-3">
      <UserMenu user={{ name: "Maya Chen", email: "maya@example.com" }} status={status} onStatusChange={setStatus} theme={theme} onThemeChange={setTheme} onSignOut={() => {}} />
      <p className="text-sm text-muted-foreground">Status: {status}, theme: {theme}</p>
    </div>
  );
}
// #endregion
