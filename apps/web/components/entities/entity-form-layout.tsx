import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

type EntityFormLayoutProps = {
  title: string
  description: string
  cancelHref: string
  isSubmitting?: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
}

export function EntityFormLayout({
  title,
  description,
  cancelHref,
  children,
  isSubmitting,
  onSubmit,
}: EntityFormLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <form onSubmit={onSubmit}>
          <CardContent className="space-y-6">{children}</CardContent>

          <CardFooter className="justify-end gap-3 border-t">
            <Button type="button" variant="outline" size="lg" asChild>
              <Link href={cancelHref}>Cancel</Link>
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
