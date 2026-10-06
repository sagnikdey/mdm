"use client";

import { useState, type ReactNode } from "react";
import { GitCommitHorizontal, TriangleAlert, UserPlus } from "lucide-react";
import { Button, Timeline, type TimelineEvent } from "@sagui/ui";
import { activity, timelineNow } from "./sample-data";

/** System events have no person behind them, so they get an icon instead of an avatar. */
const icons: Record<string, ReactNode> = { e2: <TriangleAlert size={14} />, e6: <UserPlus size={14} /> };
const withIcons = activity.map((event) => ({ ...event, icon: icons[event.id] }));

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-lg">
      <Timeline events={withIcons} now={timelineNow} label="Project activity" />
    </div>
  );
}
// #endregion

// #region Live
export function Live() {
  const [events, setEvents] = useState<TimelineEvent[]>(withIcons.slice(2));
  const [now, setNow] = useState(timelineNow);
  function add() {
    const at = now + 60_000;
    setNow(at);
    setEvents((list) => [{ id: `n${at}`, at, actor: "You", title: "pushed 2 commits to main", meta: "Just now", icon: <GitCommitHorizontal size={14} />, tone: "success" }, ...list]);
  }
  return (
    <div className="grid w-full max-w-lg gap-4">
      <Button variant="outline" size="sm" className="w-fit" onClick={add}>Add an update</Button>
      <Timeline events={events} now={now} label="Project activity" maxHeight={360} />
    </div>
  );
}
// #endregion
