import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

export function InputDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="demo-email">Email</Label>
      <Input id="demo-email" type="email" placeholder="you@example.com" />
    </div>
  )
}
