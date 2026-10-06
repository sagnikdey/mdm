"use client";

import { useState } from "react";
import { Button, Skeleton } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-sm">
      <Skeleton avatar lines={3} />
    </div>
  );
}
// #endregion

// #region Reveal
export function Reveal() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="grid w-full max-w-sm gap-4">
      <Skeleton loading={loading} lines={2}>
        <div>
          <p className="type-title">Acme renewal</p>
          <p className="type-body-sm text-muted-foreground">$42,000 · closes in 12 days</p>
        </div>
      </Skeleton>
      <Button size="sm" variant="outline" className="w-fit" onClick={() => setLoading((value) => !value)}>{loading ? "Finish loading" : "Load again"}</Button>
    </div>
  );
}
// #endregion
