import Link from "next/link"
import { FileEdit, Package, Settings } from "lucide-react"

import {
  getAnnotatedPacket,
  getPendingProfileEdit,
  getPortalAccountById,
  getVendorSnapshot,
  listVendorProducts,
} from "@workspace/vendor-onboarding"

import { requireVendorSession } from "@/lib/auth/session"
import {
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
} from "@sagui/ui"

export default async function DashboardPage() {
  const session = await requireVendorSession()
  const account = await getPortalAccountById(session.accountId)
  const [profile, products, packet, pendingEdit] = await Promise.all([
    getVendorSnapshot(session.vendorId),
    listVendorProducts(session.vendorId),
    getAnnotatedPacket(session.vendorId, account?.allowedCategoryIds ?? []),
    getPendingProfileEdit(session.vendorId),
  ])

  const packetCount = packet?.itemCount ?? 0
  const packetPending = packet?.status === "pending"

  const stats = [
    {
      label: "Products",
      value: products.length,
      href: "/products",
      icon: Package,
      description: `${products.filter((product) => product.isActive).length} live SKUs`,
    },
    {
      label: packetPending ? "Pending review" : "Draft packet",
      value: packetCount + (pendingEdit ? 1 : 0),
      href: packetCount ? "/products/review" : pendingEdit ? "/settings" : "/products/add",
      icon: FileEdit,
      description: packetCount
        ? `${packetCount} product${packetCount === 1 ? "" : "s"} ${packetPending ? "waiting" : "in draft"}`
        : pendingEdit
          ? "Profile edit waiting"
          : "Nothing waiting",
    },
    {
      label: "Settings",
      value: pendingEdit ? "In review" : "Current",
      href: "/settings",
      icon: Settings,
      description: "Contact and payment details",
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-fg-muted">
          {profile?.vendorName ?? "Your vendor account"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href} className="block rounded-container">
              <Panel className="h-full transition-colors hover:bg-bg-muted">
                <PanelHeader action={<Icon className="size-4 text-fg-muted" />}>
                  <PanelTitle as="h2">{stat.label}</PanelTitle>
                </PanelHeader>
                <PanelContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-fg-muted">{stat.description}</p>
                </PanelContent>
              </Panel>
            </Link>
          )
        })}
      </div>

      <Panel>
        <PanelHeader className="pb-5">
          <PanelTitle as="h2">Catalog</PanelTitle>
          <PanelDescription>
            Add products in bulk, by barcode, or by hand. Send the packet once
            when you are done — MDM reviews the whole list.
          </PanelDescription>
        </PanelHeader>
      </Panel>
    </div>
  )
}
