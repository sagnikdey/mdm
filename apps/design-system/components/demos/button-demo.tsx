import { Button } from "@workspace/ui/components/button"

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Primary</Button>
      <Button variant="secondary">Subtle</Button>
      <Button variant="outline">Brand</Button>
      <Button disabled>Disabled</Button>
    </div>
  )
}
