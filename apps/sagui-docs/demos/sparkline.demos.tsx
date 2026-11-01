"use client";

import { Sparkline } from "@sagui/ui";

const week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// #region Hero
export function Hero() {
  return <Sparkline label="Signups" data={[12, 18, 15, 22, 30, 27, 34]} labels={week} value="34" change="+26%" tone="success" />;
}
// #endregion

// #region Tones
export function Tones() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Sparkline label="Revenue" data={[40, 42, 41, 45, 47, 46, 52]} labels={week} value="$52k" change="+8.3%" />
      <Sparkline label="Churn" data={[2.1, 2.3, 2.2, 2.6, 2.9, 3.1, 3.4]} labels={week} value="3.4%" change="+1.3 pts" tone="danger" />
      <Sparkline label="Latency" data={[180, 210, 190, 260, 240, 250, 230]} labels={week} value="230 ms" change="+12%" tone="warning" />
      <Sparkline label="Uptime" data={[99.9, 99.95, 99.9, 99.99, 99.98, 99.99, 100]} labels={week} value="100%" change="Stable" tone="success" area={false} />
    </div>
  );
}
// #endregion

// #region Static
export function Static() {
  return <Sparkline label="Visitors" data={[310, 280, 340, 360, 330, 390, 420]} value="420" change="+35%" interactive={false} />;
}
// #endregion
