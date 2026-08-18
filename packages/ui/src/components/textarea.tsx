import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import {
  formControlFieldStyles,
  formControlStyles,
} from "@workspace/ui/lib/form-control"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        formControlFieldStyles,
        formControlStyles,
        "flex field-sizing-content min-h-16 resize-none p-3",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
