"use client";

import { BottomSheet, BottomSheetClose, Button } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <BottomSheet title="Trip details" description="Lisbon, 12 to 16 May" trigger={<Button>Open sheet</Button>}>
      <div className="grid gap-3">
        {Array.from({ length: 12 }, (_, index) => (
          <div key={index} className="rounded-[var(--radius-md)] border border-border p-3">Itinerary item {index + 1}</div>
        ))}
        <BottomSheetClose asChild><Button variant="outline">Done</Button></BottomSheetClose>
      </div>
    </BottomSheet>
  );
}
// #endregion

// #region ThreeDetents
export function ThreeDetents() {
  return (
    <BottomSheet title="Filters" detents={[0.3, 0.6, 0.92]} initialDetent={1} trigger={<Button variant="outline">Three detents</Button>}>
      <p className="text-muted-foreground">Drag the handle, flick, or use the arrow keys on the grabber to move between heights.</p>
    </BottomSheet>
  );
}
// #endregion
