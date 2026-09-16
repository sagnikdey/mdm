import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export function CardDemo() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Store inventory</CardTitle>
        <CardDescription>Summary for Texas Operations</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          33 availability rules across 10 active stores.
        </p>
      </CardContent>
    </Card>
  )
}
