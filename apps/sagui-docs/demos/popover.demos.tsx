"use client";

import { Button, Input, Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="h-64 w-full">
      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild><Button variant="outline">Rename</Button></PopoverTrigger>
          <PopoverContent>
            <div className="grid gap-3">
              <Input label="Project name" defaultValue="Atlas redesign" />
              <PopoverClose asChild><Button size="sm">Save</Button></PopoverClose>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
// #endregion

// #region Sides
export function Sides() {
  return (
    <div className="flex h-64 w-full items-center justify-center">
      <Popover>
        <PopoverTrigger asChild><Button variant="outline">Opens above</Button></PopoverTrigger>
        <PopoverContent side="top" align="center">
          <p className="text-sm text-muted-foreground">Radix flips the side when there is no room.</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
// #endregion
