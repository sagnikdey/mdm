"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { DataTable } from "@/components/data-table/data-table"
import {
  buildProductFilters,
  productColumns,
  type ProductRow,
} from "@/components/tables/products-columns"
import { categoriesAPI, productsAPI, vendorsAPI } from "@/lib/api-client"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function ProductsTable() {
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsAPI.list(),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.list(),
  })

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => vendorsAPI.list(),
  })

  const rows = useMemo<ProductRow[]>(
    () =>
      products.map((product) => ({
        ...product,
        categoryName:
          categories.find((c) => c.categoryId === product.categoryId)
            ?.categoryName ?? product.categoryId,
        vendorName:
          vendors.find((v) => v.vendorId === product.vendorId)?.vendorName ??
          product.vendorId,
      })),
    [products, categories, vendors]
  )

  const filters = useMemo(() => buildProductFilters(rows), [rows])

  if (productsLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  return (
    <DataTable
      columns={productColumns}
      data={rows}
      searchKey="productName"
      searchPlaceholder="Search products..."
      filters={filters}
    />
  )
}
