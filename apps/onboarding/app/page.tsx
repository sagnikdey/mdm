import Link from "next/link"

import {
  Button,
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
} from "@sagui/ui"

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center p-6">
      <Panel elevation="resting" className="w-full">
        <PanelHeader>
          <PanelTitle as="h2">Vendor Onboarding</PanelTitle>
          <PanelDescription>
            This portal is invite-only. Open the link from your invitation email to
            begin onboarding.
          </PanelDescription>
        </PanelHeader>
        <PanelContent>
          <Button asChild variant="outline">
            <Link href="/expired?reason=invalid">Learn about expired invites</Link>
          </Button>
        </PanelContent>
      </Panel>
    </main>
  )
}
