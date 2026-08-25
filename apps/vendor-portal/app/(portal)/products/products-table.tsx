"use client"

import { useMemo } from "react"

import type {
  CatalogCategory,
  CatalogProduct,
} from "@workspace/vendor-onboarding/portal-types"

import { DataTable } from "@/components/data-table/data-table"
import {
  buildCatalogFilters,
  catalogColumns,
  type CatalogRow,
} from "@/app/(portal)/products/products-columns"

type ProductsTableProps = {
  products: CatalogProduct[]
  categories: CatalogCategory[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const rows = useMemo<CatalogRow[]>(
    () =>
      products.map((product) => ({
        id: product.sku,
        kind: "live" as const,
        productName: product.productName,
        sku: product.sku,
        vendorSku: product.vendorSku,
        categoryName: product.categoryName,
        wholesalePrice: product.wholesalePrice,
        status: product.isActive ? ("active" as const) : ("inactive" as const),
      })),
    [products]
  )

  const filters = useMemo(() => buildCatalogFilters(rows), [rows])

  return (
    <DataTable
      columns={catalogColumns}
      data={rows}
      searchKey="productName"
      searchPlaceholder="Search products..."
      filters={filters}
    />
  )
}
