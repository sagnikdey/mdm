import { Badge } from "@workspace/ui/components/badge"

export function BadgeDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="outline" className="border-primary/40 text-primary">
        Brand
      </Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="active">Success</Badge>
    </div>
  )
}
