import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import {
  formControlFieldStyles,
  formControlSingleLineStyles,
  formControlStyles,
} from "@workspace/ui/lib/form-control"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        formControlFieldStyles,
        formControlSingleLineStyles,
        formControlStyles,
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm/relaxed file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
