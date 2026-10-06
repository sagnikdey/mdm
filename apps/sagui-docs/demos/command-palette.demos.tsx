"use client";

import { useState } from "react";
import { FilePlus2, Handshake, LayoutDashboard, Settings, Users } from "lucide-react";
import { Button, CommandPalette, Dialog, DialogContent } from "@sagui/ui";

const items = [
  { id: "overview", label: "Overview", group: "Pages", icon: <LayoutDashboard /> },
  { id: "deals", label: "Deals", group: "Pages", icon: <Handshake />, keywords: ["opportunities"] },
  { id: "team", label: "Team", group: "Pages", icon: <Users /> },
  { id: "new-deal", label: "Create deal", description: "Start from a blank deal", group: "Actions", icon: <FilePlus2 />, shortcut: "N" },
  { id: "settings", label: "Settings", group: "Actions", icon: <Settings />, shortcut: "⌘," },
];

// #region Hero
export function Hero() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <div className="grid w-full max-w-lg gap-3">
      <CommandPalette items={items} onSelect={(item) => setLast(item.label)} />
      <p className="text-sm text-muted-foreground">{last ? `Ran: ${last}` : "Type to filter, use the arrow keys, press Enter."}</p>
    </div>
  );
}
// #endregion

// #region InDialog
export function InDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Open command palette</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="Search" className="p-0">
          <CommandPalette items={items} autoFocus onSelect={() => setOpen(false)} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
// #endregion
