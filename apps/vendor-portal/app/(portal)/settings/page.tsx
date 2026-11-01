import Link from "next/link"

import {
  getPendingProfileEdit,
  getVendorSnapshot,
} from "@workspace/vendor-onboarding"

import { requireVendorSession } from "@/lib/auth/session"
import {
  Alert,
  Badge,
  Button,
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@sagui/ui"

export default async function SettingsPage() {
  const session = await requireVendorSession()
  const [profile, pendingEdit] = await Promise.all([
    getVendorSnapshot(session.vendorId),
    getPendingProfileEdit(session.vendorId),
  ])

  if (!profile) {
    return <p className="p-6 text-sm text-fg-muted">Vendor not found.</p>
  }

  const rows = [
    ["Company", profile.vendorName],
    ["Category", profile.vendorCategory],
    ["Contact", profile.contactPerson],
    ["Email", profile.email],
    ["Phone", profile.phone],
    ["Address", profile.address],
    ["Payment terms", profile.paymentTerms],
    ["Minimum order", String(profile.minimumOrderQuantity)],
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-1 text-fg-muted">
            Changes go to MDM review before they update master data.
          </p>
        </div>
        {pendingEdit ? (
          <Button disabled>Request edit</Button>
        ) : (
          <Button asChild>
            <Link href="/settings/edit">Request edit</Link>
          </Button>
        )}
      </div>

      {pendingEdit ? (
        <Alert tone="info" title="Pending review">
          {`Submitted ${new Date(pendingEdit.createdAt).toLocaleString()}. You can submit another edit after this one is reviewed.`}
        </Alert>
      ) : null}

      <Panel>
        <PanelHeader action={<Badge tone="success">Live</Badge>}>
          <PanelTitle as="h2">Current profile</PanelTitle>
        </PanelHeader>
        <PanelContent className="grid gap-3 text-sm sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <p key={label}>
              <span className="text-fg-muted">{label}: </span>
              {value || "—"}
            </p>
          ))}
        </PanelContent>
      </Panel>
    </div>
  )
}
