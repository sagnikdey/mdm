import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Vendor Onboarding</CardTitle>
          <CardDescription>
            This portal is invite-only. Open the link from your invitation email to
            begin onboarding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/expired?reason=invalid">Learn about expired invites</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
