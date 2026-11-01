import { redirect } from "next/navigation"

import {
  Button,
  Panel,
  PanelContent,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
} from "@sagui/ui"

type PageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function ContinueLoginPage({ searchParams }: PageProps) {
  const { token } = await searchParams
  if (!token?.trim()) redirect("/login?error=invalid")

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center p-6">
      <Panel elevation="resting" className="w-full">
        <PanelHeader>
          <PanelTitle as="h2">Vendor portal</PanelTitle>
          <PanelDescription>
            Confirm this login on this device. Email apps sometimes open the link
            before you do, which would otherwise use it up.
          </PanelDescription>
        </PanelHeader>
        <PanelContent>
          <p className="text-sm text-fg-muted">
            You&apos;ll stay signed in on this browser for 7 days.
          </p>
        </PanelContent>
        <form action="/auth/verify" method="post">
          <input type="hidden" name="token" value={token} />
          <PanelFooter>
            <Button type="submit">Continue</Button>
          </PanelFooter>
        </form>
      </Panel>
    </main>
  )
}
