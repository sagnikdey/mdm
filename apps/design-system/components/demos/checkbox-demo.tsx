"use client"

import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"

export function CheckboxDemo() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="kit-checkbox" defaultChecked />
      <Label htmlFor="kit-checkbox" className="font-normal">
        Accept terms
      </Label>
    </div>
  )
}
