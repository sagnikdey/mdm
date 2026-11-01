"use client";

import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { Badge, Button } from "@sagui/ui";

// #region Hero
export function Hero() {
  return <Badge tone="success">Live</Badge>;
}
// #endregion

// #region Tones
export function Tones() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge tone="neutral">Draft</Badge>
      <Badge tone="success">Live</Badge>
      <Badge tone="info">Beta</Badge>
      <Badge tone="warning">Review</Badge>
      <Badge tone="danger">Failed</Badge>
    </div>
  );
}
// #endregion

// #region Sizes
export function Sizes() {
  return (
    <div className="flex items-center gap-2">
      <Badge size="sm" tone="info">Small</Badge>
      <Badge size="md" tone="info">Medium</Badge>
    </div>
  );
}
// #endregion

// #region WithIcon
export function WithIcon() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge tone="success" icon={<Check size={12} />}>Deployed</Badge>
      <Badge tone="warning" icon={<Clock size={12} />}>Pending</Badge>
    </div>
  );
}
// #endregion

// #region Morphing
export function Morphing() {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <Badge tone={done ? "success" : "warning"} icon={done ? <Check size={12} /> : <Clock size={12} />}>
        {done ? "Deployed" : "Deploying"}
      </Badge>
      <Button variant="outline" size="sm" onClick={() => setDone((value) => !value)}>Toggle</Button>
    </div>
  );
}
// #endregion
