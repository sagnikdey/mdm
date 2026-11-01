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

import { getPortalAccountByVendorId } from "@workspace/vendor-onboarding"

import { PortalAccessCard } from "@/app/vendors/[id]/portal-access-card"
import { RecordTable } from "@/components/tables/record-table"
import {
  categoriesAPI,
  productsAPI,
  relationshipsAPI,
  storesAPI,
  vendorsAPI,
} from "@/lib/api"

interface VendorDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function VendorDetailPage({
  params,
}: VendorDetailPageProps) {
  const { id } = await params
  const vendor = await vendorsAPI.get(id)

  if (!vendor) {
    notFound()
  }

  const [relationships, products, stores, portalAccount, categories] =
    await Promise.all([
      relationshipsAPI.getByVendor(id),
      productsAPI.list(),
      storesAPI.list(),
      getPortalAccountByVendorId(id).catch(() => undefined),
      categoriesAPI.list(),
    ])

  const vendorProducts = products.filter((p) => p.vendorId === id)

  const storeName = (storeId: string) =>
    stores.find((s) => s.storeId === storeId)?.storeName ?? storeId

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ms-2">
            <Link href="/vendors">← Back to Vendors</Link>
          </Button>
          <h1 className="text-3xl font-bold">{vendor.vendorName}</h1>
          <p className="mt-1 capitalize text-fg-muted">
            {vendor.vendorCategory} supplier
          </p>
        </div>
        <Badge tone={vendor.isActive ? "success" : "neutral"}>
          {vendor.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <Panel as="section">
        <PanelHeader>
          <PanelTitle as="h2">Vendor information</PanelTitle>
          <PanelDescription>Contact details and commercial terms</PanelDescription>
        </PanelHeader>
        <PanelContent className="grid gap-8 text-sm md:grid-cols-2">
          <dl className="grid gap-3">
            <div>
              <dt className="text-fg-muted">Contact</dt>
              <dd className="font-medium">{vendor.contactPerson}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Email</dt>
              <dd className="font-medium">{vendor.email}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Phone</dt>
              <dd className="font-medium">{vendor.phone}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Address</dt>
              <dd className="font-medium">{vendor.address}</dd>
            </div>
          </dl>
          <dl className="grid content-start gap-3">
            <div>
              <dt className="text-fg-muted">Payment terms</dt>
              <dd className="font-medium">{vendor.paymentTerms}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Minimum order</dt>
              <dd className="font-medium">{vendor.minimumOrderQuantity} units</dd>
            </div>
          </dl>
        </PanelContent>
      </Panel>

      <PortalAccessCard
        vendorId={vendor.vendorId}
        email={vendor.email}
        account={portalAccount ?? null}
        categories={categories}
      />

      <Panel as="section">
        <PanelHeader>
          <PanelTitle as="h2">Store relationships</PanelTitle>
          <PanelDescription>Stores this vendor delivers to</PanelDescription>
        </PanelHeader>
        <PanelContent>
          <RecordTable
            caption="Store relationships"
            itemName={{ one: "store", other: "stores" }}
            emptyMessage="No store relationships."
            rows={relationships.map((rel) => ({
              id: rel.relationshipId,
              store: storeName(rel.storeId),
              storeHref: `/stores/${rel.storeId}`,
              representative: rel.vendorRepresentative,
              frequency: rel.deliveryFrequency,
              days: rel.deliveryDays.join(", "),
            }))}
            columns={[
              { key: "store", label: "Store", hrefKey: "storeHref" },
              { key: "representative", label: "Representative" },
              { key: "frequency", label: "Frequency" },
              { key: "days", label: "Delivery Days" },
            ]}
          />
        </PanelContent>
      </Panel>

      <Panel as="section">
        <PanelHeader>
          <PanelTitle as="h2">Products</PanelTitle>
          <PanelDescription>Catalog items from this vendor</PanelDescription>
        </PanelHeader>
        <PanelContent>
          <RecordTable
            caption="Products from this vendor"
            itemName={{ one: "product", other: "products" }}
            emptyMessage="No products."
            rows={vendorProducts.map((product) => ({
              id: product.sku,
              product: product.productName,
              productHref: `/products/${product.sku}`,
              sku: product.sku,
              wholesale: `$${product.wholesalePrice.toFixed(2)}`,
              status: product.isActive ? "Active" : "Inactive",
            }))}
            columns={[
              { key: "product", label: "Product", hrefKey: "productHref" },
              { key: "sku", label: "SKU" },
              { key: "wholesale", label: "Wholesale" },
              { key: "status", label: "Status", successValues: ["Active"] },
            ]}
          />
        </PanelContent>
      </Panel>
    </div>
  )
}
