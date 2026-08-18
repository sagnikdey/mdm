import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

type ContextCardProps = {
  title: string
  source: string
  sourceType?: string
  excerpt?: string
  className?: string
}

export function ContextCard({
  title,
  source,
  sourceType = "PDF",
  excerpt,
  className,
}: ContextCardProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardHeader className="gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{sourceType}</Badge>
          <CardDescription className="truncate">{source}</CardDescription>
        </div>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      {excerpt ? (
        <CardContent>
          <p className="text-xs leading-relaxed text-muted-foreground">{excerpt}</p>
        </CardContent>
      ) : null}
    </Card>
  )
}
