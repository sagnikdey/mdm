import { getVendorSnapshot } from "@workspace/vendor-onboarding"

import { PortalShell } from "@/components/portal-shell"
import { requireVendorSession } from "@/lib/auth/session"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireVendorSession()
  const profile = await getVendorSnapshot(session.vendorId)

  return (
    <PortalShell
      vendorName={profile?.vendorName ?? "Vendor portal"}
      email={session.email}
    >
      {children}
    </PortalShell>
  )
}
