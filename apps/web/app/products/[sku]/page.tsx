import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
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
  categoriesAPI,
  productsAPI,
  storesAPI,
  vendorsAPI,
} from "@/lib/api"

interface ProductDetailPageProps {
  params: Promise<{ sku: string }>
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
        <Badge variant={product.isActive ? "default" : "secondary"}>
          {product.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Category</CardDescription>
            <CardTitle className="text-lg">
              {category?.categoryName ?? product.categoryId}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vendor</CardDescription>
            <CardTitle className="text-lg">
              {vendor ? (
                <Link href={`/vendors/${vendor.vendorId}`} className="hover:underline">
                  {vendor.vendorName}
                </Link>
              ) : (
                product.vendorId
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Wholesale Price</CardDescription>
            <CardTitle className="text-lg">
              ${product.wholesalePrice.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unit of Measure</CardDescription>
            <CardTitle className="text-lg capitalize">
              {product.unitOfMeasure}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Description: </span>
            {product.description}
          </p>
          <p>
            <span className="text-muted-foreground">Vendor SKU: </span>
            {product.vendorSku}
          </p>
          <p>
            <span className="text-muted-foreground">Barcode: </span>
            {product.barcode}
          </p>
          <p>
            <span className="text-muted-foreground">Units per Case: </span>
            {product.unitsPerCase}
          </p>
          <p>
            <span className="text-muted-foreground">Weight: </span>
            {product.weight} lbs
          </p>
        </CardContent>
      </Card>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="text-lg font-semibold">
            Store availability
          </GlassCardTitle>
          <GlassCardDescription>
            Pricing and stock levels by location
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
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
                          href={`/stores/${item.storeId}`}
                          className="font-medium hover:underline"
                        >
                          {storeName(item.storeId)}
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
    </div>
  )
}
