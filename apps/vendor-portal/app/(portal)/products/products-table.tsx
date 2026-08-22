"use client"

import { useMemo } from "react"

import type {
  CatalogCategory,
  CatalogProduct,
  ProductSubmissionItem,
} from "@workspace/vendor-onboarding"

import { DataTable } from "@/components/data-table/data-table"
import {
  buildCatalogFilters,
  catalogColumns,
  type CatalogRow,
} from "@/app/(portal)/products/products-columns"

type ProductsTableProps = {
  products: CatalogProduct[]
  pending: Array<ProductSubmissionItem & { createdAt?: string }>
  categories: CatalogCategory[]
}

export function ProductsTable({
  products,
  pending,
  categories,
}: ProductsTableProps) {
  const rows = useMemo<CatalogRow[]>(() => {
    const live = products.map((product) => ({
      id: product.sku,
      kind: "live" as const,
      productName: product.productName,
      sku: product.sku,
      vendorSku: product.vendorSku,
      categoryName: product.categoryName,
      wholesalePrice: product.wholesalePrice,
      status: product.isActive ? ("active" as const) : ("inactive" as const),
    }))

    const waiting = pending.map((item) => ({
      id: `pending-${item.id}`,
      kind: "pending" as const,
      productName: item.productName,
      sku: "Pending",
      vendorSku: item.vendorSku,
      categoryName:
        categories.find((category) => category.categoryId === item.categoryId)
          ?.categoryName ??
        item.categoryId ??
        "—",
      wholesalePrice: item.wholesalePrice,
      status: "pending" as const,
    }))

    return [...waiting, ...live]
  }, [categories, pending, products])

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
