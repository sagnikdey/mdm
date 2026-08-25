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
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@workspace/ui/components/glass-card"

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
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="mt-1 text-muted-foreground">
          {profile?.vendorName ?? "Your vendor account"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href} className="block">
              <GlassCard className="transition-colors hover:bg-white/60 dark:hover:bg-white/12">
                <GlassCardHeader className="flex flex-row items-center justify-between pb-2">
                  <GlassCardTitle>{stat.label}</GlassCardTitle>
                  <Icon className="size-4 text-muted-foreground" />
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </GlassCardContent>
              </GlassCard>
            </Link>
          )
        })}
      </div>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Catalog</GlassCardTitle>
          <GlassCardDescription>
            Add products in bulk, by barcode, or by hand. Send the packet once
            when you are done — MDM reviews the whole list.
          </GlassCardDescription>
        </GlassCardHeader>
      </GlassCard>
    </div>
  )
}
