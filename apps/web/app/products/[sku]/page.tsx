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
  categoriesAPI,
  productsAPI,
  storesAPI,
  vendorsAPI,
} from "@/lib/api"

interface ProductDetailPageProps {
  params: Promise<{ sku: string }>
}

function StatTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Panel>
      <PanelHeader className="pb-5">
        <PanelDescription>{label}</PanelDescription>
        <PanelTitle as="h2" className="text-lg">{children}</PanelTitle>
      </PanelHeader>
    </Panel>
  )
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { sku } = await params
  const product = await productsAPI.get(sku)

  if (!product) {
    notFound()
  }

  const [category, vendor, availability, stores] = await Promise.all([
    categoriesAPI.get(product.categoryId),
    vendorsAPI.get(product.vendorId),
    availabilityAPI.getBySku(sku),
    storesAPI.list(),
  ])

  const storeName = (storeId: string) =>
    stores.find((s) => s.storeId === storeId)?.storeName ?? storeId

  const details = [
    ["Brand", product.brand || "—"],
    ["Manufacturer", product.manufacturer || "—"],
    ["Description", product.description],
    ["Vendor SKU", product.vendorSku],
    ["Barcode", product.barcode],
    [
      "Pack",
      `${product.packType} / ${product.packSize}${product.baseUnitSku ? ` (base ${product.baseUnitSku})` : ""}`,
    ],
    ["Units per Case", String(product.unitsPerCase)],
    ["Weight", `${product.weight} ${product.weightUnit}`],
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ms-2">
            <Link href="/products">← Back to Products</Link>
          </Button>
          <h1 className="text-3xl font-bold">{product.productName}</h1>
          <p className="mt-1 text-fg-muted">SKU: {product.sku}</p>
        </div>
        <Badge tone={product.isActive ? "success" : "neutral"}>
          {product.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Category">{category?.categoryName ?? product.categoryId}</StatTile>
        <StatTile label="Vendor">
          {vendor ? (
            <Link href={`/vendors/${vendor.vendorId}`} className="hover:underline">
              {vendor.vendorName}
            </Link>
          ) : (
            product.vendorId
          )}
        </StatTile>
        <StatTile label="Wholesale Price">${product.wholesalePrice.toFixed(2)}</StatTile>
        <StatTile label="Unit of Measure">
          <span className="capitalize">{product.unitOfMeasure}</span>
        </StatTile>
      </div>

      <Panel as="section">
        <PanelHeader>
          <PanelTitle as="h2">Product Details</PanelTitle>
        </PanelHeader>
        <PanelContent className="grid gap-2 text-sm sm:grid-cols-2">
          {details.map(([label, value]) => (
            <p key={label}>
              <span className="text-fg-muted">{label}: </span>
              {value}
            </p>
          ))}
        </PanelContent>
      </Panel>

      <Panel as="section">
        <PanelHeader>
          <PanelTitle as="h2">Store availability</PanelTitle>
          <PanelDescription>Pricing and stock levels by location</PanelDescription>
        </PanelHeader>
        <PanelContent>
          <RecordTable
            caption="Store availability"
            itemName={{ one: "store", other: "stores" }}
            emptyMessage="No availability records."
            rows={availability.map((item) => ({
              id: item.availabilityId,
              store: storeName(item.storeId),
              storeHref: `/stores/${item.storeId}`,
              retailPrice: `$${item.retailPrice.toFixed(2)}`,
              minMax: `${item.minStockLevel} / ${item.maxStockLevel}`,
              reorderPoint: item.reorderPoint,
              available: item.isAvailable ? "Yes" : "No",
            }))}
            columns={[
              { key: "store", label: "Store", hrefKey: "storeHref" },
              { key: "retailPrice", label: "Retail Price" },
              { key: "minMax", label: "Min / Max" },
              { key: "reorderPoint", label: "Reorder Point" },
              { key: "available", label: "Available", successValues: ["Yes"] },
            ]}
          />
        </PanelContent>
      </Panel>
    </div>
  )
}
