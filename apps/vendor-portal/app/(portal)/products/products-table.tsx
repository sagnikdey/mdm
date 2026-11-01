"use client"

import { useMemo } from "react"
import Link from "next/link"

import type { CatalogProduct } from "@workspace/vendor-onboarding/portal-types"
import { Badge, Button, SortableDataTable } from "@sagui/ui"

type CatalogRow = {
  sku: string
  productName: string
  vendorSku: string
  categoryName: string
  wholesalePrice: number
  status: "Active" | "Inactive"
}

export function ProductsTable({ products }: { products: CatalogProduct[] }) {
  const rows = useMemo<CatalogRow[]>(
    () =>
      products.map((product) => ({
        sku: product.sku,
        productName: product.productName,
        vendorSku: product.vendorSku,
        categoryName: product.categoryName,
        wholesalePrice: product.wholesalePrice,
        status: product.isActive ? "Active" : "Inactive",
      })),
    [products]
  )

  return (
    <SortableDataTable
      caption="Products"
      rows={rows}
      rowKey="sku"
      itemName={{ one: "product", other: "products" }}
      emptyMessage="No products yet."
      noResultsMessage="No matching products."
      searchable
      searchPlaceholder="Search products..."
      viewOptions
      pageSize={10}
      columns={[
        {
          key: "productName",
          label: "Product",
          hideable: false,
          render: (value, row) => (
            <Link href={`/products/${row.sku}`} className="font-medium hover:underline">
              {String(value)}
            </Link>
          ),
        },
        { key: "sku", label: "SKU" },
        { key: "vendorSku", label: "Vendor SKU" },
        { key: "categoryName", label: "Category", filterable: true },
        {
          key: "wholesalePrice",
          label: "Wholesale",
          numeric: true,
          render: (value) => `$${Number(value).toFixed(2)}`,
        },
        {
          key: "status",
          label: "Status",
          filterable: true,
          render: (value) => (
            <Badge tone={value === "Active" ? "success" : "neutral"}>{String(value)}</Badge>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          sortable: false,
          searchable: false,
          hideable: false,
          render: (_value, row) => (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/products/${row.sku}`}>View</Link>
            </Button>
          ),
        },
      ]}
    />
  )
}
