import { format } from "date-fns"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@workspace/ui/components/glass-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import {
  availabilityAPI,
  inventoryAPI,
  productsAPI,
  relationshipsAPI,
  storesAPI,
  vendorsAPI,
} from "@/lib/api"

interface StoreDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  const { id } = await params
  const store = await storesAPI.get(id)

  if (!store) {
    notFound()
  }

  const [relationships, availability, inventory, vendors, products] =
    await Promise.all([
      relationshipsAPI.getByStore(id),
      availabilityAPI.getByStore(id),
      inventoryAPI.getByStore(id),
      vendorsAPI.list(),
      productsAPI.list(),
    ])

  const vendorName = (vendorId: string) =>
    vendors.find((v) => v.vendorId === vendorId)?.vendorName ?? vendorId

  const productName = (sku: string) =>
    products.find((p) => p.sku === sku)?.productName ?? sku

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ms-2">
            <Link href="/stores">← Back to Stores</Link>
          </Button>
          <h2 className="text-3xl font-bold">{store.storeName}</h2>
          <p className="mt-1 text-muted-foreground">
            {store.address} • {store.city}, {store.state} {store.zipCode}
          </p>
        </div>
        <Badge variant={store.isActive ? "default" : "secondary"}>
          {store.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Region</CardDescription>
            <CardTitle className="text-lg">{store.region}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Store Type</CardDescription>
            <CardTitle className="text-lg capitalize">{store.storeType}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Manager</CardDescription>
            <CardTitle className="text-lg">{store.manager}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {store.managerPhone}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Square Footage</CardDescription>
            <CardTitle className="text-lg">
              {store.squareFootage.toLocaleString()} sq ft
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(store.operatingHours).map(([day, hours]) => (
              <div key={day} className="flex justify-between rounded-lg border p-3">
                <span className="capitalize">{day}</span>
                <span className="text-muted-foreground">{hours}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-lg font-semibold">
            Vendor relationships
          </GlassCardTitle>
          <GlassCardDescription>
            Delivery schedules for this store
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Representative</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Delivery Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relationships.length ? (
                  relationships.map((rel) => (
                    <TableRow key={rel.relationshipId}>
                      <TableCell>
                        <Link
                          href={`/vendors/${rel.vendorId}`}
                          className="font-medium hover:underline"
                        >
                          {vendorName(rel.vendorId)}
                        </Link>
                      </TableCell>
                      <TableCell>{rel.vendorRepresentative}</TableCell>
                      <TableCell>{rel.deliveryFrequency}</TableCell>
                      <TableCell>{rel.deliveryDays.join(", ")}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No vendor relationships.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-lg font-semibold">
            Product availability
          </GlassCardTitle>
          <GlassCardDescription>
            Retail pricing and stock thresholds
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Retail Price</TableHead>
                  <TableHead>Min / Max</TableHead>
                  <TableHead>Reorder Point</TableHead>
                  <TableHead>Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availability.length ? (
                  availability.map((item) => (
                    <TableRow key={item.availabilityId}>
                      <TableCell>
                        <Link
                          href={`/products/${item.sku}`}
                          className="font-medium hover:underline"
                        >
                          {productName(item.sku)}
                        </Link>
                      </TableCell>
                      <TableCell>${item.retailPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        {item.minStockLevel} / {item.maxStockLevel}
                      </TableCell>
                      <TableCell>{item.reorderPoint}</TableCell>
                      <TableCell>
                        <Badge variant={item.isAvailable ? "active" : "inactive"}>
                          {item.isAvailable ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No availability records.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-lg font-semibold">Inventory</GlassCardTitle>
          <GlassCardDescription>
            Current stock at this location
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Last Count</TableHead>
                  <TableHead>Next Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.length ? (
                  inventory.map((record) => (
                    <TableRow key={record.inventoryId}>
                      <TableCell>
                        <Link
                          href={`/inventory/${record.inventoryId}`}
                          className="font-medium hover:underline"
                        >
                          {productName(record.sku)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {record.currentQuantity} {record.unitOfMeasure}
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.lastCountDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.nextCountDate), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No inventory records.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}
