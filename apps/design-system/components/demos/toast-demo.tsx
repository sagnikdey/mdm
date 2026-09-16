"use client"

import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

export function ToastDemo() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast.success("Profile settings were updated.", {
          description: "Changes apply across your workspace.",
        })
      }
    >
      Create toast
    </Button>
  )
}
