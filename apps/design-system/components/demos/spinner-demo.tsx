import { Loader2Icon } from "lucide-react"

export function SpinnerDemo() {
  return (
    <Loader2Icon
      className="size-6 animate-spin text-muted-foreground"
      aria-label="Loading"
    />
  )
}
