import Link from "next/link"
import { notFound } from "next/navigation"

import { getVendorProduct } from "@workspace/vendor-onboarding"

import { requireVendorSession } from "@/lib/auth/session"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@workspace/ui/components/glass-card"

type PageProps = {
  params: Promise<{ sku: string }>
}

export default async function PortalProductPage({ params }: PageProps) {
  const session = await requireVendorSession()
  const { sku } = await params
  const product = await getVendorProduct(session.vendorId, sku)

  if (!product) notFound()

  const rows = [
    ["SKU", product.sku],
    ["Brand", product.brand || "—"],
    ["Manufacturer", product.manufacturer || "—"],
    ["Vendor SKU", product.vendorSku],
    ["Category", product.categoryName],
    ["Pack", `${product.packType} / ${product.packSize}`],
    ["Base unit", product.baseUnitSku || "—"],
    ["Wholesale", `$${product.wholesalePrice.toFixed(2)}`],
    ["Unit of measure", product.unitOfMeasure || "—"],
    ["Units per case", String(product.unitsPerCase)],
    ["Weight", `${product.weight} ${product.weightUnit}`],
    ["Barcode", product.barcode || "—"],
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ms-2">
            <Link href="/products">← Back to Products</Link>
          </Button>
          <h2 className="text-3xl font-bold">{product.productName}</h2>
          <p className="mt-1 text-muted-foreground">SKU: {product.sku}</p>
        </div>
        <Badge variant={product.isActive ? "active" : "inactive"}>
          {product.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Product details</GlassCardTitle>
          <GlassCardDescription>
            Live master data. Request an edit from MDM if something is wrong.
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent className="grid gap-3 text-sm sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <p key={label}>
              <span className="text-muted-foreground">{label}: </span>
              {value}
            </p>
          ))}
          {product.description ? (
            <p className="sm:col-span-2">
              <span className="text-muted-foreground">Description: </span>
              {product.description}
            </p>
          ) : null}
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}
