import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
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
            <Link key={stat.label} href={stat.href}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.label}
                  </CardTitle>
                  <Icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Store-Vendor Relationships</CardTitle>
            <CardDescription>
              Active delivery partnerships across locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{relationships.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Configured store-vendor delivery schedules
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Product Availability</CardTitle>
            <CardDescription>
              Store-level pricing and stock thresholds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{availability.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Products available across store locations
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
