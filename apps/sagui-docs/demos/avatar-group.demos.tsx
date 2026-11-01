"use client";

import { useState } from "react";
import { AvatarGroup, Button } from "@sagui/ui";

const team = ["Maya Chen", "Sam Ortiz", "Priya Nair", "Leo Fischer", "Ana Souza", "Tom Becker", "Ivy Park"].map((name) => ({ name }));

// #region Hero
export function Hero() {
  return <div className="pt-8"><AvatarGroup members={team} max={4} /></div>;
}
// #endregion

// #region Sizes
export function Sizes() {
  return (
    <div className="grid gap-4 pt-8">
      <AvatarGroup members={team} size="sm" max={3} />
      <AvatarGroup members={team} size="md" max={3} />
      <AvatarGroup members={team} size="lg" max={3} />
    </div>
  );
}
// #endregion

// #region Joining
export function Joining() {
  const [count, setCount] = useState(3);
  return (
    <div className="grid gap-4 pt-8">
      <AvatarGroup members={team.slice(0, count)} max={4} />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setCount((value) => Math.min(team.length, value + 1))}>Add person</Button>
        <Button variant="outline" size="sm" onClick={() => setCount((value) => Math.max(1, value - 1))}>Remove person</Button>
      </div>
    </div>
  );
}
// #endregion
