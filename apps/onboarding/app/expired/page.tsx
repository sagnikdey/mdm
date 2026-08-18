import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

const REASONS: Record<string, { title: string; description: string }> = {
  invalid: {
    title: "Invalid invitation",
    description: "This invitation link is not recognized. Request a new invite from your buyer.",
  },
  expired: {
    title: "Invitation expired",
    description: "Invitations expire after 14 days. Ask your buyer to send a fresh link.",
  },
  revoked: {
    title: "Invitation revoked",
    description: "This invitation was cancelled by the buyer team.",
  },
  used: {
    title: "Invitation already used",
    description: "This link was already redeemed. Contact your buyer if you need access again.",
  },
  no_session: {
    title: "Session expired",
    description: "Your onboarding session ended. Re-open your invitation link to continue.",
  },
}

type PageProps = {
  searchParams: Promise<{ reason?: string }>
}

export default async function ExpiredPage({ searchParams }: PageProps) {
  const { reason = "invalid" } = await searchParams
  const copy = REASONS[reason] ?? REASONS.invalid

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center p-6">
      <Card className="w-full border-destructive/30">
        <CardHeader>
          <CardTitle>{copy!.title}</CardTitle>
          <CardDescription>{copy!.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/">Back to portal home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
