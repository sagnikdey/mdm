import Link from "next/link"

import {
  Button,
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
} from "@sagui/ui"

export default function AuthSentPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center p-6">
      <Panel elevation="resting" className="w-full">
        <PanelHeader>
          <PanelTitle as="h2" className="text-2xl font-bold">
            Check your email
          </PanelTitle>
          <PanelDescription>
            If that address has an active portal account, a login link is on its
            way. The link expires in 15 minutes.
          </PanelDescription>
        </PanelHeader>
        <PanelContent>
          <p className="mb-4 text-sm text-fg-muted">
            Locally, the link is printed in the vendor-portal server log.
          </p>
          <Button asChild variant="outline">
            <Link href="/login">Use a different email</Link>
          </Button>
        </PanelContent>
      </Panel>
    </main>
  )
}
