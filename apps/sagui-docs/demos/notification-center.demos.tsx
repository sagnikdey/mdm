"use client";

import { NotificationCenter } from "@sagui/ui";

const face = (id: string) => `https://images.unsplash.com/${id}?w=96&h=96&q=80&auto=format&fit=crop&crop=faces`;
const notifications = [
  { id: "n1", title: "Maya Chen closed Acme", description: "$42,000, two weeks ahead of forecast.", time: "8m", tone: "success" as const, actor: { name: "Maya Chen", photo: face("photo-1494790108377-be9c29b29330") } },
  { id: "n2", title: "Globex is waiting on legal", description: "Contract review has been open for 6 days.", time: "1h", tone: "warning" as const },
  { id: "n3", title: "Samir Patel mentioned you", description: "Can you check the discount on Initech?", time: "3h", actor: { name: "Samir Patel", photo: face("photo-1507003211169-0a1dd7228f2d") } },
  { id: "n4", title: "Q3 forecast is ready", time: "Yesterday", read: true, tone: "info" as const },
];

// #region Hero
export function Hero() {
  return <NotificationCenter notifications={notifications} />;
}
// #endregion

// #region AllRead
export function AllRead() {
  return <NotificationCenter notifications={notifications.map((item) => ({ ...item, read: true }))} />;
}
// #endregion
