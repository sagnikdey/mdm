import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
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

  const [relationships, products, stores] = await Promise.all([
    relationshipsAPI.getByVendor(id),
    productsAPI.list(),
    storesAPI.list(),
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
          <h2 className="text-3xl font-bold">{vendor.vendorName}</h2>
          <p className="mt-1 capitalize text-muted-foreground">
            {vendor.vendorCategory} supplier
          </p>
        </div>
        <Badge variant={vendor.isActive ? "active" : "inactive"}>
          {vendor.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-lg font-semibold">
            Vendor information
          </GlassCardTitle>
          <GlassCardDescription>
            Contact details and commercial terms
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent className="grid gap-8 text-sm md:grid-cols-2">
          <dl className="grid gap-3">
            <div>
              <dt className="text-muted-foreground">Contact</dt>
              <dd className="font-medium">{vendor.contactPerson}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{vendor.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{vendor.phone}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Address</dt>
              <dd className="font-medium">{vendor.address}</dd>
            </div>
          </dl>
          <dl className="grid gap-3">
            <div>
              <dt className="text-muted-foreground">Payment terms</dt>
              <dd className="font-medium">{vendor.paymentTerms}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Minimum order</dt>
              <dd className="font-medium">{vendor.minimumOrderQuantity} units</dd>
            </div>
          </dl>
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-lg font-semibold">
            Store relationships
          </GlassCardTitle>
          <GlassCardDescription>
            Stores this vendor delivers to
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
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
                          href={`/stores/${rel.storeId}`}
                          className="font-medium hover:underline"
                        >
                          {storeName(rel.storeId)}
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
                      No store relationships.
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
          <GlassCardTitle className="text-lg font-semibold">Products</GlassCardTitle>
          <GlassCardDescription>
            Catalog items from this vendor
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Wholesale</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorProducts.length ? (
                  vendorProducts.map((product) => (
                    <TableRow key={product.sku}>
                      <TableCell>
                        <Link
                          href={`/products/${product.sku}`}
                          className="font-medium hover:underline"
                        >
                          {product.productName}
                        </Link>
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>${product.wholesalePrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "active" : "inactive"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No products.
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
