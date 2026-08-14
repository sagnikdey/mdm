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
        <Badge variant={vendor.isActive ? "default" : "secondary"}>
          {vendor.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Contact: </span>
              {vendor.contactPerson}
            </p>
            <p>
              <span className="text-muted-foreground">Email: </span>
              {vendor.email}
            </p>
            <p>
              <span className="text-muted-foreground">Phone: </span>
              {vendor.phone}
            </p>
            <p>
              <span className="text-muted-foreground">Address: </span>
              {vendor.address}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Payment Terms: </span>
              {vendor.paymentTerms}
            </p>
            <p>
              <span className="text-muted-foreground">Minimum Order: </span>
              {vendor.minimumOrderQuantity} units
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Relationships</CardTitle>
          <CardDescription>Stores this vendor delivers to</CardDescription>
        </CardHeader>
        <CardContent>
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
              {relationships.map((rel) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Catalog items from this vendor</CardDescription>
        </CardHeader>
        <CardContent>
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
              {vendorProducts.map((product) => (
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
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
