import Link from "next/link"

import { InviteVendorForm } from "@/app/admin/vendors/invite/invite-vendor-form"
import { fetchInvitations } from "@/app/admin/vendors/invite/actions"
import { RecordTable } from "@/components/tables/record-table"
import {
  Button,
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
} from "@sagui/ui"

export default async function InviteVendorPage() {
  const invitations = await fetchInvitations()

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vendor invitations</h1>
          <p className="mt-1 text-fg-muted">
            Send invite-only onboarding links to prospective vendors
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/applications">Review applications</Link>
        </Button>
      </div>

      <InviteVendorForm />

      <Panel as="section">
        <PanelHeader>
          <PanelTitle as="h2">Recent invitations</PanelTitle>
          <PanelDescription>
            Token hashes are stored; raw links are only shown once at creation.
          </PanelDescription>
        </PanelHeader>
        <PanelContent>
          <RecordTable
            caption="Recent invitations"
            itemName={{ one: "invitation", other: "invitations" }}
            emptyMessage="No invitations yet."
            rows={invitations.map((invite) => ({
              id: String(invite.id),
              email: invite.invitedEmail,
              company: invite.invitedCompany ?? "No company prefilled",
              invitedBy: invite.invitedByEmail,
              status: invite.status,
            }))}
            columns={[
              { key: "email", label: "Email" },
              { key: "company", label: "Company" },
              { key: "invitedBy", label: "Invited by" },
              { key: "status", label: "Status", successValues: ["pending"] },
            ]}
          />
        </PanelContent>
      </Panel>
    </div>
  )
}
