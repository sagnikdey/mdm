import Link from "next/link"

import { InviteVendorForm } from "@/app/admin/vendors/invite/invite-vendor-form"
import { fetchInvitations } from "@/app/admin/vendors/invite/actions"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@workspace/ui/components/glass-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

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

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Recent invitations</GlassCardTitle>
          <GlassCardDescription>Token hashes are stored; raw links are only shown once at creation.</GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Invited by</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.length ? (
                  invitations.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">
                        {invite.invitedEmail}
                      </TableCell>
                      <TableCell>
                        {invite.invitedCompany ?? "No company prefilled"}
                      </TableCell>
                      <TableCell>{invite.invitedByEmail}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invite.status === "pending" ? "active" : "inactive"
                          }
                        >
                          {invite.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No invitations yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}
