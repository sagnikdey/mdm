import { getVendorSnapshot } from "@workspace/vendor-onboarding"

import { AppSidebar } from "@/components/app-sidebar"
import { PortalHeader } from "@/components/portal-header"
import { requireVendorSession } from "@/lib/auth/session"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireVendorSession()
  const profile = await getVendorSnapshot(session.vendorId)

  return (
    <SidebarProvider>
      <AppSidebar
        vendorName={profile?.vendorName ?? "Vendor portal"}
        email={session.email}
      />
      <SidebarInset className="relative z-10 bg-transparent">
        <PortalHeader />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
