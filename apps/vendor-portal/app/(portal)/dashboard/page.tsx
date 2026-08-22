import Link from "next/link"
import { FileEdit, Package, Settings } from "lucide-react"

import {
  getPendingProfileEdit,
  getVendorSnapshot,
  listPendingCatalogItems,
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
  const [profile, products, pendingItems, pendingEdit] = await Promise.all([
    getVendorSnapshot(session.vendorId),
    listVendorProducts(session.vendorId),
    listPendingCatalogItems(session.vendorId),
    getPendingProfileEdit(session.vendorId),
  ])

  const stats = [
    {
      label: "Products",
      value: products.length,
      href: "/products",
      icon: Package,
      description: `${products.filter((product) => product.isActive).length} live SKUs`,
    },
    {
      label: "Pending review",
      value: pendingItems.length + (pendingEdit ? 1 : 0),
      href: pendingItems.length ? "/products" : "/settings",
      icon: FileEdit,
      description: pendingItems.length
        ? `${pendingItems.length} product submission${pendingItems.length === 1 ? "" : "s"}`
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
            Add products the same way MDM does. New items go to staff review
            before they become live SKUs.
          </GlassCardDescription>
        </GlassCardHeader>
      </GlassCard>
    </div>
  )
}
