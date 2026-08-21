import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@workspace/ui/components/glass-card"
import { Archive, Building2, Package, Users } from "lucide-react"
import Link from "next/link"

import {
  availabilityAPI,
  inventoryAPI,
  productsAPI,
  relationshipsAPI,
  storesAPI,
  vendorsAPI,
} from "@/lib/api"

export default async function DashboardPage() {
  const [stores, vendors, products, inventory, relationships, availability] =
    await Promise.all([
      storesAPI.list(),
      vendorsAPI.list(),
      productsAPI.list(),
      inventoryAPI.list(),
      relationshipsAPI.list(),
      availabilityAPI.list(),
    ])

  const stats = [
    {
      label: "Stores",
      value: stores.length,
      href: "/stores",
      icon: Building2,
      description: `${stores.filter((s) => s.isActive).length} active`,
    },
    {
      label: "Vendors",
      value: vendors.length,
      href: "/vendors",
      icon: Users,
      description: `${vendors.length} suppliers`,
    },
    {
      label: "Products",
      value: products.length,
      href: "/products",
      icon: Package,
      description: `${products.filter((p) => p.isActive).length} active SKUs`,
    },
    {
      label: "Inventory Records",
      value: inventory.length,
      href: "/inventory",
      icon: Archive,
      description: `${availability.length} availability rules`,
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="mt-1 text-muted-foreground">
          Convenience store master data overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Store-Vendor Relationships</GlassCardTitle>
            <GlassCardDescription>
              Active delivery partnerships across locations
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-bold">{relationships.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Configured store-vendor delivery schedules
            </p>
          </GlassCardContent>
        </GlassCard>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Product Availability</GlassCardTitle>
            <GlassCardDescription>
              Store-level pricing and stock thresholds
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-bold">{availability.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Products available across store locations
            </p>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  )
}
