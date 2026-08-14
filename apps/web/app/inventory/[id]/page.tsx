import { format } from "date-fns"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import {
  availabilityAPI,
  inventoryAPI,
  productsAPI,
  storesAPI,
} from "@/lib/api"

interface InventoryDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function InventoryDetailPage({
  params,
}: InventoryDetailPageProps) {
  const { id } = await params
  const record = await inventoryAPI.get(id)

  if (!record) {
    notFound()
  }

  const [store, product, availability] = await Promise.all([
    storesAPI.get(record.storeId),
    productsAPI.get(record.sku),
    availabilityAPI.list(),
  ])

  const storeAvailability = availability.find(
    (a) => a.storeId === record.storeId && a.sku === record.sku
  )

  return (
    <div className="space-y-6 p-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ms-2">
          <Link href="/inventory">← Back to Inventory</Link>
        </Button>
        <h2 className="text-3xl font-bold">
          {product?.productName ?? record.sku}
        </h2>
        <p className="mt-1 text-muted-foreground">
          {store?.storeName ?? record.storeId} • {record.inventoryId}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Quantity</CardDescription>
            <CardTitle className="text-lg">
              {record.currentQuantity} {record.unitOfMeasure}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Last Count</CardDescription>
            <CardTitle className="text-lg">
              {format(new Date(record.lastCountDate), "MMM d, yyyy")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Next Count</CardDescription>
            <CardTitle className="text-lg">
              {format(new Date(record.nextCountDate), "MMM d, yyyy")}
            </CardTitle>
          </CardHeader>
        </Card>
        {storeAvailability ? (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Reorder Point</CardDescription>
              <CardTitle className="text-lg">
                {storeAvailability.reorderPoint}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              Min: {storeAvailability.minStockLevel} / Max:{" "}
              {storeAvailability.maxStockLevel}
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Store</CardTitle>
            <CardDescription>Location for this inventory record</CardDescription>
          </CardHeader>
          <CardContent>
            {store ? (
              <Link
                href={`/stores/${store.storeId}`}
                className="font-medium hover:underline"
              >
                {store.storeName}
              </Link>
            ) : (
              record.storeId
            )}
            {store ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {store.city}, {store.state}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Product</CardTitle>
            <CardDescription>SKU details</CardDescription>
          </CardHeader>
          <CardContent>
            {product ? (
              <>
                <Link
                  href={`/products/${product.sku}`}
                  className="font-medium hover:underline"
                >
                  {product.productName}
                </Link>
                <p className="mt-2 text-sm text-muted-foreground">
                  SKU: {product.sku} • Wholesale: $
                  {product.wholesalePrice.toFixed(2)}
                </p>
              </>
            ) : (
              record.sku
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
