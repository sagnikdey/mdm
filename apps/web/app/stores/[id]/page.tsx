import { format } from "date-fns"
import Link from "next/link"
import { notFound } from "next/navigation"

import {
  Badge,
  Button,
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
} from "@sagui/ui"

import { RecordTable } from "@/components/tables/record-table"
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

function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Panel>
      <PanelHeader className="pb-5">
        <PanelDescription>{label}</PanelDescription>
        <PanelTitle as="h2" className="text-lg">{value}</PanelTitle>
        {note ? <PanelDescription>{note}</PanelDescription> : null}
      </PanelHeader>
    </Panel>
  )
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
          <h1 className="text-3xl font-bold">{store.storeName}</h1>
          <p className="mt-1 text-fg-muted">
            {store.address} • {store.city}, {store.state} {store.zipCode}
          </p>
        </div>
        <Badge tone={store.isActive ? "success" : "neutral"}>
          {store.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Region" value={store.region} />
        <StatTile
          label="Store Type"
          value={`${store.storeType[0]!.toUpperCase()}${store.storeType.slice(1)}`}
        />
        <StatTile label="Manager" value={store.manager} note={store.managerPhone} />
        <StatTile label="Square Footage" value={`${store.squareFootage.toLocaleString()} sq ft`} />
      </div>

      <Panel as="section">
        <PanelHeader>
          <PanelTitle as="h2">Operating Hours</PanelTitle>
        </PanelHeader>
        <PanelContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(store.operatingHours).map(([day, hours]) => (
              <div
                key={day}
                className="flex justify-between rounded-control border border-border-default p-3"
              >
                <span className="capitalize">{day}</span>
                <span className="text-fg-muted">{hours}</span>
              </div>
            ))}
          </div>
        </PanelContent>
      </Panel>

      <Panel as="section">
        <PanelHeader>
          <PanelTitle as="h2">Vendor relationships</PanelTitle>
          <PanelDescription>Delivery schedules for this store</PanelDescription>
        </PanelHeader>
        <PanelContent>
          <RecordTable
            caption="Vendor relationships"
            itemName={{ one: "vendor", other: "vendors" }}
            emptyMessage="No vendor relationships."
            rows={relationships.map((rel) => ({
              id: rel.relationshipId,
              vendor: vendorName(rel.vendorId),
              vendorHref: `/vendors/${rel.vendorId}`,
              representative: rel.vendorRepresentative,
              frequency: rel.deliveryFrequency,
              days: rel.deliveryDays.join(", "),
            }))}
            columns={[
              { key: "vendor", label: "Vendor", hrefKey: "vendorHref" },
              { key: "representative", label: "Representative" },
              { key: "frequency", label: "Frequency" },
              { key: "days", label: "Delivery Days" },
            ]}
          />
        </PanelContent>
      </Panel>

      <Panel as="section">
        <PanelHeader>
          <PanelTitle as="h2">Product availability</PanelTitle>
          <PanelDescription>Retail pricing and stock thresholds</PanelDescription>
        </PanelHeader>
        <PanelContent>
          <RecordTable
            caption="Product availability"
            itemName={{ one: "product", other: "products" }}
            emptyMessage="No availability records."
            rows={availability.map((item) => ({
              id: item.availabilityId,
              product: productName(item.sku),
              productHref: `/products/${item.sku}`,
              retailPrice: `$${item.retailPrice.toFixed(2)}`,
              minMax: `${item.minStockLevel} / ${item.maxStockLevel}`,
              reorderPoint: item.reorderPoint,
              available: item.isAvailable ? "Yes" : "No",
            }))}
            columns={[
              { key: "product", label: "Product", hrefKey: "productHref" },
              { key: "retailPrice", label: "Retail Price" },
              { key: "minMax", label: "Min / Max" },
              { key: "reorderPoint", label: "Reorder Point" },
              { key: "available", label: "Available", successValues: ["Yes"] },
            ]}
          />
        </PanelContent>
      </Panel>

      <Panel as="section">
        <PanelHeader>
          <PanelTitle as="h2">Inventory</PanelTitle>
          <PanelDescription>Current stock at this location</PanelDescription>
        </PanelHeader>
        <PanelContent>
          <RecordTable
            caption="Inventory"
            itemName={{ one: "record", other: "records" }}
            emptyMessage="No inventory records."
            rows={inventory.map((record) => ({
              id: record.inventoryId,
              product: productName(record.sku),
              productHref: `/inventory/${record.inventoryId}`,
              quantity: `${record.currentQuantity} ${record.unitOfMeasure}`,
              lastCount: format(new Date(record.lastCountDate), "MMM d, yyyy"),
              nextCount: format(new Date(record.nextCountDate), "MMM d, yyyy"),
            }))}
            columns={[
              { key: "product", label: "Product", hrefKey: "productHref" },
              { key: "quantity", label: "Quantity" },
              { key: "lastCount", label: "Last Count" },
              { key: "nextCount", label: "Next Count" },
            ]}
          />
        </PanelContent>
      </Panel>
    </div>
  )
}
