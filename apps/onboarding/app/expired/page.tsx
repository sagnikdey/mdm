import Link from "next/link"

import {
  Button,
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
} from "@sagui/ui"

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
      <Panel elevation="resting" className="w-full border-danger-border">
        <PanelHeader>
          <PanelTitle as="h2">{copy!.title}</PanelTitle>
          <PanelDescription>{copy!.description}</PanelDescription>
        </PanelHeader>
        <PanelContent>
          <Button asChild variant="outline">
            <Link href="/">Back to portal home</Link>
          </Button>
        </PanelContent>
      </Panel>
    </main>
  )
}
