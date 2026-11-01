import { format } from "date-fns"
import Link from "next/link"
import { notFound } from "next/navigation"


import {
  availabilityAPI,
  inventoryAPI,
  productsAPI,
  storesAPI,
} from "@/lib/api"
import { Button, Panel, PanelContent, PanelDescription, PanelHeader, PanelTitle } from "@sagui/ui"

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
        <h1 className="text-3xl font-bold">
          {product?.productName ?? record.sku}
        </h1>
        <p className="mt-1 text-fg-muted">
          {store?.storeName ?? record.storeId} • {record.inventoryId}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel>
          <PanelHeader className="pb-5">
            <PanelDescription>Current Quantity</PanelDescription>
            <PanelTitle as="h2" className="text-lg">
              {record.currentQuantity} {record.unitOfMeasure}
            </PanelTitle>
          </PanelHeader>
        </Panel>
        <Panel>
          <PanelHeader className="pb-5">
            <PanelDescription>Last Count</PanelDescription>
            <PanelTitle as="h2" className="text-lg">
              {format(new Date(record.lastCountDate), "MMM d, yyyy")}
            </PanelTitle>
          </PanelHeader>
        </Panel>
        <Panel>
          <PanelHeader className="pb-5">
            <PanelDescription>Next Count</PanelDescription>
            <PanelTitle as="h2" className="text-lg">
              {format(new Date(record.nextCountDate), "MMM d, yyyy")}
            </PanelTitle>
          </PanelHeader>
        </Panel>
        {storeAvailability ? (
          <Panel>
            <PanelHeader className="pb-5">
              <PanelDescription>Reorder Point</PanelDescription>
              <PanelTitle as="h2" className="text-lg">
                {storeAvailability.reorderPoint}
              </PanelTitle>
            </PanelHeader>
            <PanelContent className="-mt-4 pt-0 text-sm text-fg-muted">
              Min: {storeAvailability.minStockLevel} / Max:{" "}
              {storeAvailability.maxStockLevel}
            </PanelContent>
          </Panel>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <PanelHeader>
            <PanelTitle as="h2">Store</PanelTitle>
            <PanelDescription>Location for this inventory record</PanelDescription>
          </PanelHeader>
          <PanelContent>
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
              <p className="mt-2 text-sm text-fg-muted">
                {store.city}, {store.state}
              </p>
            ) : null}
          </PanelContent>
        </Panel>
        <Panel>
          <PanelHeader>
            <PanelTitle as="h2">Product</PanelTitle>
            <PanelDescription>SKU details</PanelDescription>
          </PanelHeader>
          <PanelContent>
            {product ? (
              <>
                <Link
                  href={`/products/${product.sku}`}
                  className="font-medium hover:underline"
                >
                  {product.productName}
                </Link>
                <p className="mt-2 text-sm text-fg-muted">
                  SKU: {product.sku} • Wholesale: $
                  {product.wholesalePrice.toFixed(2)}
                </p>
              </>
            ) : (
              record.sku
            )}
          </PanelContent>
        </Panel>
      </div>
    </div>
  )
}
