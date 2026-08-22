import Link from "next/link"

import {
  getPendingProfileEdit,
  getVendorSnapshot,
} from "@workspace/vendor-onboarding"

import { requireVendorSession } from "@/lib/auth/session"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@workspace/ui/components/glass-card"

export default async function SettingsPage() {
  const session = await requireVendorSession()
  const [profile, pendingEdit] = await Promise.all([
    getVendorSnapshot(session.vendorId),
    getPendingProfileEdit(session.vendorId),
  ])

  if (!profile) {
    return <p className="p-6 text-sm text-muted-foreground">Vendor not found.</p>
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
          <p className="mt-1 text-muted-foreground">
            Changes go to MDM review before they update master data.
          </p>
        </div>
        <Button asChild disabled={Boolean(pendingEdit)}>
          <Link href="/settings/edit">Request edit</Link>
        </Button>
      </div>

      {pendingEdit ? (
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Pending review</GlassCardTitle>
            <GlassCardDescription>
              Submitted {new Date(pendingEdit.createdAt).toLocaleString()}. You
              can submit another edit after this one is reviewed.
            </GlassCardDescription>
          </GlassCardHeader>
        </GlassCard>
      ) : null}

      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center justify-between gap-3">
            <GlassCardTitle>Current profile</GlassCardTitle>
            <Badge variant="active">Live</Badge>
          </div>
        </GlassCardHeader>
        <GlassCardContent className="grid gap-3 text-sm sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <p key={label}>
              <span className="text-muted-foreground">{label}: </span>
              {value || "—"}
            </p>
          ))}
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}
