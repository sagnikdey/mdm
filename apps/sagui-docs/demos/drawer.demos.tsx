"use client";

import { Button, Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <Drawer>
      <DrawerTrigger asChild><Button variant="outline">Filters</Button></DrawerTrigger>
      <DrawerContent title="Filters" description="Narrow the list of projects.">
        <div className="grid gap-4">
          <p className="text-muted-foreground">Drag the header toward the edge to dismiss, or press Escape.</p>
          <DrawerClose asChild><Button>Apply filters</Button></DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
// #endregion

// #region Left
export function Left() {
  return (
    <Drawer>
      <DrawerTrigger asChild><Button variant="outline">Menu</Button></DrawerTrigger>
      <DrawerContent side="left" title="Navigation">
        <nav className="grid gap-1 text-sm">
          {["Overview", "Projects", "Members", "Billing"].map((item) => <a key={item} href="#" className="rounded-md px-3 py-2 hover:bg-muted">{item}</a>)}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
// #endregion

// #region Bottom
export function Bottom() {
  return (
    <Drawer>
      <DrawerTrigger asChild><Button variant="outline">Share</Button></DrawerTrigger>
      <DrawerContent side="bottom" title="Share project">
        <DrawerClose asChild><Button>Copy link</Button></DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
// #endregion
