import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@workspace/ui/components/glass-card"

export default function AuthSentPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center p-6">
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-2xl font-bold">
            Check your email
          </GlassCardTitle>
          <GlassCardDescription>
            If that address has an active portal account, a login link is on its
            way. The link expires in 15 minutes.
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Locally, the link is printed in the vendor-portal server log.
          </p>
          <Button asChild variant="outline">
            <Link href="/login">Use a different email</Link>
          </Button>
        </GlassCardContent>
      </GlassCard>
    </main>
  )
}
