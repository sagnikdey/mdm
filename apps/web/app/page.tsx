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
import { Panel, PanelContent, PanelDescription, PanelHeader, PanelTitle } from "@sagui/ui"

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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-fg-muted">
          Convenience store master data overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href} className="block">
              <Panel className="transition-colors hover:bg-bg-muted">
                <PanelHeader action={<Icon className="size-4 text-fg-muted" />}>
                  <PanelTitle as="h2">{stat.label}</PanelTitle>
                </PanelHeader>
                <PanelContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-fg-muted">
                    {stat.description}
                  </p>
                </PanelContent>
              </Panel>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader>
            <PanelTitle as="h2">Store-Vendor Relationships</PanelTitle>
            <PanelDescription>
              Active delivery partnerships across locations
            </PanelDescription>
          </PanelHeader>
          <PanelContent>
            <p className="text-3xl font-bold">{relationships.length}</p>
            <p className="mt-1 text-sm text-fg-muted">
              Configured store-vendor delivery schedules
            </p>
          </PanelContent>
        </Panel>
        <Panel>
          <PanelHeader>
            <PanelTitle as="h2">Product Availability</PanelTitle>
            <PanelDescription>
              Store-level pricing and stock thresholds
            </PanelDescription>
          </PanelHeader>
          <PanelContent>
            <p className="text-3xl font-bold">{availability.length}</p>
            <p className="mt-1 text-sm text-fg-muted">
              Products available across store locations
            </p>
          </PanelContent>
        </Panel>
      </div>
    </div>
  )
}
