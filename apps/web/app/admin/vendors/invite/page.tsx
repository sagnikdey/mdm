import Link from "next/link"

import { InviteVendorForm } from "@/app/admin/vendors/invite/invite-vendor-form"
import { fetchInvitations } from "@/app/admin/vendors/invite/actions"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"

export default async function InviteVendorPage() {
  const invitations = await fetchInvitations()

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Vendor invitations</h2>
          <p className="mt-1 text-muted-foreground">
            Send invite-only onboarding links to prospective vendors
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/applications">Review applications</Link>
        </Button>
      </div>

      <InviteVendorForm />

      <Card>
        <CardHeader>
          <CardTitle>Recent invitations</CardTitle>
          <CardDescription>Token hashes are stored; raw links are only shown once at creation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {invitations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invitations yet.</p>
          ) : (
            invitations.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{invite.invitedEmail}</p>
                  <p className="text-xs text-muted-foreground">
                    {invite.invitedCompany ?? "No company prefilled"} · invited by{" "}
                    {invite.invitedByEmail}
                  </p>
                </div>
                <Badge variant={invite.status === "pending" ? "active" : "inactive"}>
                  {invite.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
